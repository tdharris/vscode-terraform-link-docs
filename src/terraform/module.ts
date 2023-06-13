import * as vscode from 'vscode';

const moduleRe = /^(?<match>(?<prefix>\s*source\s+=\s+")(?<moduleSource>[^"]+))"/;

export type LineMatchResult = {
  type: "module",
  range: vscode.Range,
  moduleSource: string
};

export const moduleLineMatcher: (line: vscode.TextLine) => LineMatchResult | undefined = (line: vscode.TextLine) => {
	const matchResult = moduleRe.exec(line.text);
  if (!matchResult) {
    return;
  };

  const { prefix, moduleSource, match } = matchResult.groups || {};
  const prefixLength: number = prefix!.length;
  const matchLength: number = match!.length;
  
  if (!moduleSource.startsWith("git::")) {
    return;
  };

  return {
    type: "module",
    range: new vscode.Range(
      new vscode.Position(line.lineNumber, prefixLength),
      new vscode.Position(line.lineNumber, matchLength)
    ),
    moduleSource
  };
};

// Module Sources: Generic Git Repository (with revision)
// https://developer.hashicorp.com/terraform/language/modules/sources#generic-git-repository
const parseModuleSource: (resourceType: string) => { owner: string, repo: string, module: string, ref: string } | undefined = (moduleSource) => {
  const re = /^git::((ssh:\/\/)?.*@.*)(:|\/)(?<owner>[\w-]+)\/(?<repo>[\w-]+).git\/\/(?<module>[\w-\/]+)(\?ref=(?<ref>[\w.-]+))?$/;

	const m = re.exec(moduleSource);
  if (!m) { return; };
  
	const { owner = "", repo = "", module = "", ref = "" } = m.groups || {};
	return { owner, repo, module, ref };
};

export const getLineMatchResultUri: (lmr: LineMatchResult) => vscode.Uri | undefined =
  ({ moduleSource }) => {
    const { owner, repo, module, ref } = parseModuleSource(moduleSource) || {};
    if (!owner || !repo || !module) { return; }
    const uri = `https://github.com/${owner}/${repo}/tree/${ref ? ref : 'HEAD'}/${module}`;
		return vscode.Uri.parse(uri);
  };
