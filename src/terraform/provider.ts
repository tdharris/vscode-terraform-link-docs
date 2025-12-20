import * as vscode from 'vscode';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

const providerCache = new Map<string, Map<string, string>>();

export function parseProviders(content: string): Map<string, string> {
  const map = new Map<string, string>();
  let pos = 0;

  while (true) {
    // Find next "required_providers" keyword
    const foundIndex = content.indexOf('required_providers', pos);
    if (foundIndex === -1) { break; }
    
    pos = foundIndex + 'required_providers'.length;

    // Find opening brace
    const openBrace = content.indexOf('{', pos);
    if (openBrace === -1) { break; }

    // Ensure only whitespace (and optionally an equals sign) is between keyword and brace
    // This supports both "required_providers {" and "required_providers = {"
    const gap = content.substring(pos, openBrace);
    if (gap.replace('=', '').trim().length !== 0) { continue; }

    // Extract block content by balancing braces
    let balance = 1;
    let i = openBrace + 1;
    let inString = false;
    let stringChar = ''; // ' or "

    while (i < content.length && balance > 0) {
        const char = content[i];
        
        if (inString) {
            if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        } else {
            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                balance++;
            } else if (char === '}') {
                balance--;
            } else if (char === '#') {
                // Single line comment # - skip to end of line
                const nextNewLine = content.indexOf('\n', i);
                if (nextNewLine !== -1) {
                    i = nextNewLine;
                    continue; 
                }
            } else if (char === '/' && content[i+1] === '/') {
                // Single line comment // - skip to end of line
                const nextNewLine = content.indexOf('\n', i);
                if (nextNewLine !== -1) {
                    i = nextNewLine;
                    continue;
                }
            }
        }
        i++;
    }

    if (balance === 0) {
        const blockContent = content.substring(openBrace + 1, i - 1);
        
        // Parse the providers inside this isolated block
        // We can use a simpler regex now that we are scoped to the correct block
        const providerRegex = /(?<alias>[\w-]+)\s*=\s*\{[\s\S]*?source\s*=\s*"(?<source>[^"]+)"/g;
        
        let match;
        while ((match = providerRegex.exec(blockContent)) !== null) {
            const { alias, source } = match.groups || {};
            if (alias && source) {
                map.set(alias, source);
            }
        }
        
        // Move pos to end of this block to continue searching for other blocks
        pos = i;
    } else {
        // Malformed block (unclosed), stop parsing to avoid infinite loops or errors
        break;
    }
  }

  return map;
}

export async function getProviderMap(document: vscode.TextDocument): Promise<Map<string, string>> {
  const dir = path.dirname(document.fileName);
  
  // Return cached map if available for this directory
  if (providerCache.has(dir)) {
    return providerCache.get(dir)!;
  }

  const map = new Map<string, string>();
  // Common files where required_providers might be defined
  const filesToScan = new Set(['versions.tf', 'main.tf', 'providers.tf']);
  const currentFileName = path.basename(document.fileName);
  
  // Ensure the current file is processed last so its content (live buffer) 
  // overrides any conflicting definitions from other files.
  filesToScan.delete(currentFileName);
  filesToScan.add(currentFileName);

  for (const file of filesToScan) {
    const filePath = path.join(dir, file);
    let content = '';

    if (filePath === document.fileName) {
      content = document.getText();
    } else if (existsSync(filePath)) {
      try {
        content = await fs.readFile(filePath, 'utf-8');
      } catch (e) {
        console.error(`[terraform-link-docs] Error reading ${filePath}:`, e);
        continue;
      }
    } else {
      continue;
    }

    const fileMap = parseProviders(content);
    fileMap.forEach((source, alias) => map.set(alias, source));
  }

  providerCache.set(dir, map);
  return map;
}
