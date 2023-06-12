import * as vscode from 'vscode';

const logPrefix = "[terraform-module-links]";
const moduleRe = /^(?<match>(?<prefix>\s*source\s+=\s+")(?<moduleSource>[^"]+))"/;

type LineMatchResult = {
  range: vscode.Range,
  moduleSource: string
};

const moduleLineMatcher: (line: vscode.TextLine) => LineMatchResult | undefined = (line: vscode.TextLine) => {
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
  const re = /^git::.*:(?<owner>[\w-]+)\/(?<repo>[\w-]+).git\/\/(?<module>[\w-\/]+)(\?ref=(?<ref>[\w.]+))?$/;

	const m = re.exec(moduleSource);
  if (!m) { return; };
  
	const { owner = "", repo = "", module = "", ref = "" } = m.groups || {};
	return { owner, repo, module, ref };
};

const getLineMatchResultUri: (lmr: LineMatchResult) => vscode.Uri | undefined =
  ({ moduleSource }) => {
    const { owner, repo, module, ref } = parseModuleSource(moduleSource) || {};
    if (!owner || !repo || !module) { return; }
    const uri = `https://github.com/${owner}/${repo}/tree/${ref ? ref : 'HEAD'}/${module}`;
		return vscode.Uri.parse(uri);
  };

function isNotUndefined<T>(v: T | undefined): v is T {
  return v !== undefined;
}

const linkProvider: vscode.DocumentLinkProvider = {
  provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
    const res: Array<LineMatchResult> = [];

    for (let ln = 0; ln < document.lineCount; ln++) {
      const lineMatchResult = moduleLineMatcher(document.lineAt(ln));
      if (lineMatchResult) {
        console.log(logPrefix, "LMR-MODULE", lineMatchResult);
        res.push(lineMatchResult);
      }
    }

    return res.map(lmr => {
      const uri = getLineMatchResultUri(lmr);
      if (!uri) { return; }

      const link = uri.toString();
      console.log(logPrefix, "Module link", link);
      const ln = new vscode.DocumentLink(
        lmr.range, uri
      );
      ln.tooltip = link;
      return ln;
    }).filter(isNotUndefined);
  }
};

export function activate(context: vscode.ExtensionContext) {
  const disposeLinkProvider = vscode.languages.registerDocumentLinkProvider('terraform', linkProvider);
  context.subscriptions.push(disposeLinkProvider);
}