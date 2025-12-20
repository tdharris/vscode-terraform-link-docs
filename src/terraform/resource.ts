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

export const getLineMatchResultUri: (lmr: LineMatchResult, providerMap?: Map<string, string>) => vscode.Uri | undefined =
  ({ dataOrResource, resourceType }, providerMap) => {
    const { provider, name } = resourceTypeToProviderAndName(resourceType) || {};
    if (!provider || !name) { return; }

    // Check if we have a known source for this provider alias
    if (providerMap && providerMap.has(provider)) {
      const source = providerMap.get(provider)!;
      const [namespace, providerName] = source.split('/');
      
      // Map 'resource' -> 'resources', 'data' -> 'data-sources'
      const typeSegment = dataOrResource === 'data' ? 'data-sources' : 'resources';
      
      // Construct Registry URL
      // https://registry.terraform.io/providers/<namespace>/<provider>/latest/docs/<type>/<name>
      return vscode.Uri.parse(`https://registry.terraform.io/providers/${namespace}/${providerName}/latest/docs/${typeSegment}/${name}`);
    }

    return vscode.Uri.parse(`https://www.terraform.io/docs/providers/${provider}/${dataOrResource.charAt(0)}/${name}`);
  };
