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

  return {
    type: "module",
    range: new vscode.Range(
      new vscode.Position(line.lineNumber, prefixLength),
      new vscode.Position(line.lineNumber, matchLength)
    ),
    moduleSource
  };
};

// Local Paths
// https://developer.hashicorp.com/terraform/language/modules/sources#local-paths
const getLocalPathUri: (moduleSource: string) => vscode.Uri | undefined = (moduleSource) => {
  const currentFile = vscode.window.activeTextEditor?.document.uri;
  if (!currentFile) { return; }
  if (currentFile.scheme !== "file") { return vscode.Uri.file(moduleSource); }
  const moduleUri = vscode.Uri.joinPath(currentFile, "../", moduleSource);
  return moduleUri;
};

// Generic Git Repository
// https://developer.hashicorp.com/terraform/language/modules/sources#generic-git-repository
const getGenericGitRepositoryUri: (moduleSource: string) => vscode.Uri | undefined = (moduleSource) => {
  const { domain, owner, repo, module, ref } = parseGenericGitRepositoryModuleSource(moduleSource) || {};
  if (!owner || !repo) { return; }
  const uri = `https://${domain ? domain : 'github.com'}/${owner}/${repo}/tree/${ref ? ref : 'HEAD'}/${module}`;
  if (uri == "https://github.com:gruntwork-io/terraform-aws-eks.git//modules/eks-cluster-control-plane/tree/HEAD/") {
    console.log("hello");
  }
  return vscode.Uri.parse(uri);
};

const parseGenericGitRepositoryModuleSource: (resourceType: string) => {
  domain: string, owner: string, repo: string, module: string, ref: string
} | undefined = (moduleSource) => {
  const re = /^(git::|git::ssh:\/\/)?((.*@)?)(?<domain>[^:\/]+)(:|\/)(?<owner>[\w-]+)\/(?<repo>[\w-]+)(.git)?(\/\/(?<module>[\w-\/]+)(\?ref=(?<ref>[\w.-]+))?)?$/;

  const m = re.exec(moduleSource);
  if (!m) { return; };

  const { domain = "", owner = "", repo = "", module = "", ref = "" } = m.groups || {};
  return { domain, owner, repo, module, ref };
};

// Terraform Registry
// https://developer.hashicorp.com/terraform/language/modules/sources#terraform-registry
const getTerraformRegistryUri: (moduleSource: string) => vscode.Uri | undefined = (moduleSource) => {
  // Private Registry
  if (moduleSource.split("/")[0].includes(".")) {
    // <hostname>/<namespace>/<name>/<provider>
    return vscode.Uri.parse(`https://${moduleSource}`);
  }

  // Public Registry
  if (moduleSource.split("/").length === 3) {
    // <hostname>/<namespace>/<name>
    return vscode.Uri.parse(`https://registry.terraform.io/modules/${moduleSource}`);
  }

  return;
};

export const getLineMatchResultUri: (lmr: LineMatchResult) => vscode.Uri | undefined =
  ({ moduleSource: s }) => {
    switch (true) {
      case s.startsWith("."):
        return getLocalPathUri(s);
      case s.startsWith("git::") || s.startsWith("github.com") || s.startsWith("git@github.com"):
        return getGenericGitRepositoryUri(s);
      case s.startsWith("http://") || s.startsWith("https://"):
        // vscode already handles this
        return;
      case s.startsWith("gcs::") || s.startsWith("s3::") || s.startsWith("hg::"):
        // suffix is already a url
        return;
      default:
        return getTerraformRegistryUri(s);
    }
  };
