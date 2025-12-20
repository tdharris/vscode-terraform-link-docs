import * as vscode from 'vscode';
import {
  moduleLineMatcher,
  getLineMatchResultUri as getModuleLineMatchResultUri,
  LineMatchResult as ModuleLineMatchResult
} from './terraform/module';

import {
  resourceLineMatcher,
  getLineMatchResultUri as getResourceLineMatchResultUri,
  LineMatchResult as ResourceLineMatchResult
} from './terraform/resource';

import { getProviderMap } from './terraform/provider';

const logPrefix = "[terraform-link-docs]";

function isNotUndefined<T>(v: T | undefined): v is T {
  return v !== undefined;
}

const linkProvider: vscode.DocumentLinkProvider = {
  async provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<vscode.DocumentLink[]> {
    const res: Array<ModuleLineMatchResult | ResourceLineMatchResult> = [];

    for (let ln = 0; ln < document.lineCount; ln++) {
      const line = document.lineAt(ln);
      const lineMatchResult = moduleLineMatcher(line) || resourceLineMatcher(line);
      if (lineMatchResult) {
        outputChannel.appendLine(`${logPrefix} LMR ${JSON.stringify(lineMatchResult)}`);
        res.push(lineMatchResult);
      }
    }

    const config = vscode.workspace.getConfiguration('terraform-link-docs');
    const enableCommunityProviders = config.get<boolean>('enableCommunityProviders', true);

    let providerMap: Map<string, string> | undefined;
    if (enableCommunityProviders) {
      providerMap = await getProviderMap(document);
      if (providerMap) {
        outputChannel.appendLine(`${logPrefix} Provider Map: ${JSON.stringify(Array.from(providerMap.entries()))}`);
      }
    }

    return res.map((lmr: ResourceLineMatchResult | ModuleLineMatchResult) => {
      const uri = lmr.type === 'module' ?
        getModuleLineMatchResultUri(lmr) :
        getResourceLineMatchResultUri(lmr, providerMap);
      if (!uri) { return; }

      const link = uri.toString();
      outputChannel.appendLine(`${logPrefix} ${lmr.type} link ${link}`);
      const ln = new vscode.DocumentLink(
        lmr.range, uri
      );
      ln.tooltip = link;
      return ln;
    }).filter(isNotUndefined);
  }
};

const outputChannel = vscode.window.createOutputChannel("Terraform Link Docs");

export function activate(context: vscode.ExtensionContext) {
  const disposeTerraformLinkProvider = vscode.languages.registerDocumentLinkProvider('terraform', linkProvider);
  const disposeHclLinkProvider = vscode.languages.registerDocumentLinkProvider('hcl', linkProvider);

  context.subscriptions.push(disposeTerraformLinkProvider, disposeHclLinkProvider);
  outputChannel.appendLine("Extension activated");
}