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

export const getLineMatchResultUri: (lmr: LineMatchResult, providerMap?: Map<string, string>, config?: vscode.WorkspaceConfiguration) => vscode.Uri | undefined =
  ({ dataOrResource, resourceType }, providerMap, config) => {
    const { provider, name } = resourceTypeToProviderAndName(resourceType) || {};
    if (!provider || !name) { return; }

    const typeSegment = dataOrResource === 'data' ? 'data-sources' : 'resources';
    const typeSegmentShort = dataOrResource === 'data' ? 'd' : 'r';

    // Check if we have a known source for this provider alias
    if (providerMap && providerMap.has(provider)) {
      const source = providerMap.get(provider)!;
      const [namespace, providerName] = source.split('/');
      
      let templateStr = "https://registry.terraform.io/providers/{namespace}/{providerName}/latest/docs/{typeSegment}/{name}";
      const documentationRegistry = config?.get<string>('documentationRegistry') || 'registry.terraform.io';
      
      if (documentationRegistry === 'library.tf') {
        templateStr = "https://library.tf/providers/{namespace}/{providerName}/latest/docs/{typeSegment}/{name}";
      } else if (documentationRegistry === 'search.opentofu.org') {
        templateStr = "https://search.opentofu.org/provider/{namespace}/{providerName}/latest/docs/{typeSegment}/{name}";
      } else if (documentationRegistry === 'custom') {
        templateStr = config?.get<string>('customProviderDocURLTemplate') || templateStr;
      }
      
      const url = templateStr
        .replace(/{namespace}/g, namespace)
        .replace(/{provider}/g, providerName)
        .replace(/{providerName}/g, providerName)
        .replace(/{type}/g, dataOrResource)
        .replace(/{typeSegment}/g, typeSegment)
        .replace(/{typeSegmentShort}/g, typeSegmentShort)
        .replace(/{name}/g, name)
        .replace(/{fullName}/g, resourceType);

      return vscode.Uri.parse(url);
    }

    let fallbackTemplateStr = "https://www.terraform.io/docs/providers/{provider}/{typeSegmentShort}/{name}";
    const documentationRegistry = config?.get<string>('documentationRegistry') || 'registry.terraform.io';

    if (documentationRegistry === 'library.tf') {
      fallbackTemplateStr = "https://library.tf/providers/hashicorp/{providerName}/latest/docs/{typeSegment}/{name}";
    } else if (documentationRegistry === 'search.opentofu.org') {
      fallbackTemplateStr = "https://search.opentofu.org/provider/hashicorp/{providerName}/latest/docs/{typeSegment}/{name}";
    } else if (documentationRegistry === 'custom') {
      fallbackTemplateStr = config?.get<string>('customProviderDocURLFallbackTemplate') || fallbackTemplateStr;
    }
    
    const url = fallbackTemplateStr
      .replace(/{provider}/g, provider)
      .replace(/{providerName}/g, provider)
      .replace(/{type}/g, dataOrResource)
      .replace(/{typeSegment}/g, typeSegment)
      .replace(/{typeSegmentShort}/g, typeSegmentShort)
      .replace(/{name}/g, name)
      .replace(/{fullName}/g, resourceType);

    return vscode.Uri.parse(url);
  };
