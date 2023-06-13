import * as vscode from 'vscode';

type TerraformDataOrResource = "data" | "resource";

const resourceRe = /^(?<match>(?<prefix>\s*(?<dataOrResource>resource|data)\s+")(?<resourceType>[^"]+))"/;

export type LineMatchResult = {
  type: "resource",
  range: vscode.Range,
  dataOrResource: TerraformDataOrResource,
  resourceType: string
};

export const resourceLineMatcher: (line: vscode.TextLine) => LineMatchResult | undefined = (line: vscode.TextLine) => {
  const matchResult = resourceRe.exec(line.text);
  if (!matchResult) {
    return;
  };
  const { prefix, dataOrResource, resourceType, match } = matchResult.groups || {};
  const prefixLength: number = prefix!.length;
  const matchLength: number = match!.length;
  return {
    type: "resource",
    range: new vscode.Range(
      new vscode.Position(line.lineNumber, prefixLength),
      new vscode.Position(line.lineNumber, matchLength)
    ),
    dataOrResource: dataOrResource as TerraformDataOrResource,
    resourceType
  };
};

const resourceTypeToProviderAndName: (resourceType: string) => { provider: string, name: string } | undefined =
  (resourceType) => {
    const re = /^(?<provider>[^_]+)_(?<name>.*)$/;
    const m = re.exec(resourceType);
    if (!m) { return; }

    const { provider = "", name = "" } = m.groups || {};
    return { provider, name };
  };

export const getLineMatchResultUri: (lmr: LineMatchResult) => vscode.Uri | undefined =
  ({ dataOrResource, resourceType }) => {
    const { provider, name } = resourceTypeToProviderAndName(resourceType) || {};
    if (!provider || !name) { return; }
    return vscode.Uri.parse(`https://www.terraform.io/docs/providers/${provider}/${dataOrResource.charAt(0)}/${name}`);
  };
