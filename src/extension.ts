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

const logPrefix = "[terraform-link-docs]";

function isNotUndefined<T>(v: T | undefined): v is T {
  return v !== undefined;
}

const linkProvider: vscode.DocumentLinkProvider = {
  provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
    const res: Array<ModuleLineMatchResult | ResourceLineMatchResult> = [];
  
    for (let ln = 0; ln < document.lineCount; ln++) {
      const line = document.lineAt(ln);
      const lineMatchResult = moduleLineMatcher(line) || resourceLineMatcher(line);
      if (lineMatchResult) {
        console.log(logPrefix, "LMR", lineMatchResult);
        res.push(lineMatchResult);
      }
    }

    return res.map(lmr => {
      const uri = lmr.type === 'module' ?
        getModuleLineMatchResultUri(lmr) :
        getResourceLineMatchResultUri(lmr);
      if (!uri) { return; }

      const link = uri.toString();
      console.log(logPrefix, `${lmr.type} link`, link);
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