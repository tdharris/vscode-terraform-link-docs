import * as assert from 'assert';
import * as vscode from 'vscode';
import * as tfresource from '../../terraform/resource';
import * as tfmodule from '../../terraform/module';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('resource:getLineMatchResultUri should return expected values', () => {
		const providerMap = new Map<string, string>();
		providerMap.set('digitalocean', 'digitalocean/digitalocean');
		providerMap.set('custom', 'mycorp/custom');
		providerMap.set('cloudflare', 'cloudflare/cloudflare');
		providerMap.set('datadog', 'datadog/datadog');
		providerMap.set('github', 'integrations/github');
		providerMap.set('proxmox', 'bpg/proxmox');

		const testCases = [
			// Standard HashiCorp provider (not in map, fallback)
			{
				input: "aws_instance",
				dataOrResource: "resource",
				expected: "https://www.terraform.io/docs/providers/aws/r/instance"
			},
			// 3rd party provider in map
			{
				input: "digitalocean_droplet",
				dataOrResource: "resource",
				expected: "https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/droplet"
			},
			// 3rd party provider in map (data source)
			{
				input: "digitalocean_droplet",
				dataOrResource: "data",
				expected: "https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/data-sources/droplet"
			},
			// Cloudflare
			{
				input: "cloudflare_dns_record",
				dataOrResource: "resource",
				expected: "https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record"
			},
			// Datadog
			{
				input: "datadog_monitor",
				dataOrResource: "resource",
				expected: "https://registry.terraform.io/providers/datadog/datadog/latest/docs/resources/monitor"
			},
			// GitHub (integrations namespace)
			{
				input: "github_repository",
				dataOrResource: "resource",
				expected: "https://registry.terraform.io/providers/integrations/github/latest/docs/resources/repository"
			},
			// Proxmox (bpg namespace)
			{
				input: "proxmox_virtual_environment_download_file",
				dataOrResource: "resource",
				expected: "https://registry.terraform.io/providers/bpg/proxmox/latest/docs/resources/virtual_environment_download_file"
			},
			// Unknown provider (fallback)
			{
				input: "unknown_resource",
				dataOrResource: "resource",
				expected: "https://www.terraform.io/docs/providers/unknown/r/resource"
			}
		];

		testCases.forEach(testCase => {
			const result = tfresource.getLineMatchResultUri({
				type: "resource",
				range: new vscode.Range(0, 0, 0, 0),
				resourceType: testCase.input,
				dataOrResource: testCase.dataOrResource as "data" | "resource"
			}, providerMap);
			assert.strictEqual(result?.toString(), testCase.expected, `Expected ${result?.toString()} to match ${testCase.expected} with input ${testCase.input}`);
		});
	});

	test('resource:getLineMatchResultUri should fallback to default when providerMap is undefined', () => {
		const testCases = [
			{
				input: "digitalocean_droplet",
				dataOrResource: "resource",
				expected: "https://www.terraform.io/docs/providers/digitalocean/r/droplet"
			},
			{
				input: "cloudflare_dns_record",
				dataOrResource: "resource",
				expected: "https://www.terraform.io/docs/providers/cloudflare/r/dns_record"
			}
		];

		testCases.forEach(testCase => {
			const result = tfresource.getLineMatchResultUri({
				type: "resource",
				range: new vscode.Range(0, 0, 0, 0),
				resourceType: testCase.input,
				dataOrResource: testCase.dataOrResource as "data" | "resource"
			}, undefined); // Pass undefined explicitly
			assert.strictEqual(result?.toString(), testCase.expected, `Expected ${result?.toString()} to match ${testCase.expected} with input ${testCase.input}`);
		});
	});

	test('module:getLineMatchResultUri should return expected values', () => {
		const testCases = [
			{
				input: "./consul",
				expected: "file:///./consul",
				skipCI: true
			},
			{
				input: "hashicorp/consul/aws",
				expected: "https://registry.terraform.io/modules/hashicorp/consul/aws"
			},
			{
				input: "app.terraform.io/example-corp/k8s-cluster/azurerm",
				expected: "https://app.terraform.io/example-corp/k8s-cluster/azurerm"
			},
			{
				input: "terraform-aws-modules/vpc/aws",
				expected: "https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws"
			},
			{
				input: "terraform-aws-modules/iam/aws//modules/iam-assumable-role",
				expected: "https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/latest/submodules/iam-assumable-role"
			},
			{
				input: "github.com/hashicorp/example",
				expected: "https://github.com/hashicorp/example/tree/HEAD/"
			},
			{
				input: "git@github.com:hashicorp/example.git",
				expected: "https://github.com/hashicorp/example/tree/HEAD/"
			},
			{
				input: "bitbucket.org/hashicorp/terraform-consul-aws",
				expected: "https://bitbucket.org/hashicorp/terraform-consul-aws"
			},
			{
				input: "git::https://example.com/vpc.git",
				expected: undefined
			},
			{
				input: "git::ssh://username@example.com/repo/storage.git",
				expected: "https://example.com/repo/storage/tree/HEAD/"
			},
			{
				input: "git::https://example.com/vpc.git?ref=v1.2.0",
				expected: undefined
			},
			{
				input: "git::https://example.com/storage.git?ref=51d462976d84fdea54b47d80dcabbf680badcdb8",
				expected: undefined
			},
			{
				input: "git::username@example.com:repo/storage.git",
				expected: "https://example.com/repo/storage/tree/HEAD/"
			},
			{
				input: "hg::http://example.com/vpc.hg",
				expected: undefined
			},
			{
				input: "hg::http://example.com/vpc.hg?ref=v1.2.0",
				expected: undefined
			},
			{
				input: "https://example.com/vpc-module.zip",
				expected: undefined
			},
			{
				input: "https://example.com/vpc-module?archive=zip",
				expected: undefined
			},
			{
				input: "s3::https://s3-eu-west-1.amazonaws.com/examplecorp-terraform-modules/vpc.zip",
				expected: undefined
			},
			{
				input: "gcs::https://www.googleapis.com/storage/v1/modules/foomodule.zip",
				expected: undefined
			},
			{
				input: "git::git@github.com:owner/repo.git//modules/name?ref=v0.0.1",
				expected: "https://github.com/owner/repo/tree/v0.0.1/modules/name"
			},
			{
				input: "git::git@github.com:owner/repo.git//modules/name?ref=51d462976d84fdea54b47d80dcabbf680badcdb8",
				expected: "https://github.com/owner/repo/tree/51d462976d84fdea54b47d80dcabbf680badcdb8/modules/name"
			},
			{
				input: "git::git@github.com:owner/repo.git//modules/name",
				expected: "https://github.com/owner/repo/tree/HEAD/modules/name"
			},
			{
				input: "git::ssh://git@gitlab.com/namespace/path/to/repo.git//modules/name",
				expected: "https://gitlab.com/namespace/path/to/repo/tree/HEAD/modules/name"
			},
			{
				input: "git::ssh://git@gitlab.com/namespace/path/to/repo.git//modules/name?ref=v0.0.1",
				expected: "https://gitlab.com/namespace/path/to/repo/tree/v0.0.1/modules/name"
			},
			{
				input: "git@github.com:owner/repo.git?ref=v0.0.1",
				expected: "https://github.com/owner/repo/tree/v0.0.1/"
			},
			{
				input: "hashicorp/azurerm",
				expected: undefined,
			},
			{
				input: "Azure/azapi",
				expected: undefined,
			},
		];

		testCases.forEach(testCase => {
			// Skip tests that are not supported in GitHub Actions
			if (testCase.skipCI) {
				return;
			}
			const result = tfmodule.getLineMatchResultUri({
				type: "module",
				range: new vscode.Range(0, 0, 0, 0),
				moduleSource: testCase.input,
			});
			assert.strictEqual(result?.toString(), testCase.expected, `Expected ${result?.toString()} to match ${testCase.expected} with input ${testCase.input}`);
		});
	});

	class MockConfig {
		constructor(private values: Record<string, any>) {}
		get<T>(section: string, defaultValue?: T): T {
			return (this.values[section] !== undefined ? this.values[section] : defaultValue) as any as T;
		}
		has(section: string) { return section in this.values; }
		inspect(section: string) { return undefined; }
		update() { return Promise.resolve(); }
	}

	test('resource:getLineMatchResultUri should respect library.tf documentationRegistry', () => {
		const providerMap = new Map<string, string>();
		providerMap.set('digitalocean', 'digitalocean/digitalocean');

		const config = new MockConfig({
			'documentationRegistry': 'library.tf'
		}) as any as vscode.WorkspaceConfiguration;

		const result = tfresource.getLineMatchResultUri({
			type: "resource",
			range: new vscode.Range(0, 0, 0, 0),
			resourceType: "digitalocean_droplet",
			dataOrResource: "resource"
		}, providerMap, config);

		assert.strictEqual(result?.toString(), "https://library.tf/providers/digitalocean/digitalocean/latest/docs/resources/droplet");

		const fallbackResult = tfresource.getLineMatchResultUri({
			type: "resource",
			range: new vscode.Range(0, 0, 0, 0),
			resourceType: "unknown_resource",
			dataOrResource: "resource"
		}, undefined, config);

		assert.strictEqual(fallbackResult?.toString(), "https://library.tf/providers/hashicorp/unknown/latest/docs/resources/resource");
	});

	test('module:getLineMatchResultUri should respect library.tf documentationRegistry', () => {
		const config = new MockConfig({
			'documentationRegistry': 'library.tf'
		}) as any as vscode.WorkspaceConfiguration;

		const result = tfmodule.getLineMatchResultUri({
			type: "module",
			range: new vscode.Range(0, 0, 0, 0),
			moduleSource: "hashicorp/consul/aws",
		}, config);

		assert.strictEqual(result?.toString(), "https://library.tf/modules/hashicorp/consul/aws");

		const submoduleResult = tfmodule.getLineMatchResultUri({
			type: "module",
			range: new vscode.Range(0, 0, 0, 0),
			moduleSource: "terraform-aws-modules/iam/aws//modules/iam-assumable-role",
		}, config);

		assert.strictEqual(submoduleResult?.toString(), "https://library.tf/modules/terraform-aws-modules/iam/aws/latest/submodules/iam-assumable-role");
	});

	test('resource:getLineMatchResultUri should respect custom documentationRegistry templates', () => {
		const providerMap = new Map<string, string>();
		providerMap.set('google', 'hashicorp/google');

		const config = new MockConfig({
			'documentationRegistry': 'custom',
			'customProviderDocURLTemplate': 'https://custom.corp.net/docs/{namespace}/{providerName}/{type}/{name}/{fullName}',
			'customProviderDocURLFallbackTemplate': 'https://custom.corp.net/fallback/{provider}/{type}/{fullName}'
		}) as any as vscode.WorkspaceConfiguration;

		const result = tfresource.getLineMatchResultUri({
			type: "resource",
			range: new vscode.Range(0, 0, 0, 0),
			resourceType: "google_compute_instance",
			dataOrResource: "resource"
		}, providerMap, config);

		assert.strictEqual(result?.toString(), "https://custom.corp.net/docs/hashicorp/google/resource/compute_instance/google_compute_instance");

		const fallbackResult = tfresource.getLineMatchResultUri({
			type: "resource",
			range: new vscode.Range(0, 0, 0, 0),
			resourceType: "random_pet",
			dataOrResource: "resource"
		}, undefined, config);

		assert.strictEqual(fallbackResult?.toString(), "https://custom.corp.net/fallback/random/resource/random_pet");
	});

	test('module:getLineMatchResultUri should respect custom documentationRegistry templates', () => {
		const config = new MockConfig({
			'documentationRegistry': 'custom',
			'customModuleDocURLTemplate': 'https://internal.modules/{namespace}/{name}/{provider}',
			'customSubModuleDocURLTemplate': 'https://internal.modules/{namespace}/{name}/{provider}/nested/{submodule}'
		}) as any as vscode.WorkspaceConfiguration;

		const result = tfmodule.getLineMatchResultUri({
			type: "module",
			range: new vscode.Range(0, 0, 0, 0),
			moduleSource: "hashicorp/consul/aws",
		}, config);

		assert.strictEqual(result?.toString(), "https://internal.modules/hashicorp/consul/aws");

		const submoduleResult = tfmodule.getLineMatchResultUri({
			type: "module",
			range: new vscode.Range(0, 0, 0, 0),
			moduleSource: "terraform-aws-modules/iam/aws//modules/iam-assumable-role",
		}, config);

		assert.strictEqual(submoduleResult?.toString(), "https://internal.modules/terraform-aws-modules/iam/aws/nested/iam-assumable-role");
	});

	test('resource:getLineMatchResultUri should respect search.opentofu.org documentationRegistry', () => {
		const providerMap = new Map<string, string>();
		providerMap.set('aws', 'hashicorp/aws');

		const config = new MockConfig({
			'documentationRegistry': 'search.opentofu.org'
		}) as any as vscode.WorkspaceConfiguration;

		const result = tfresource.getLineMatchResultUri({
			type: "resource",
			range: new vscode.Range(0, 0, 0, 0),
			resourceType: "aws_instance",
			dataOrResource: "resource"
		}, providerMap, config);

		assert.strictEqual(result?.toString(), "https://search.opentofu.org/provider/hashicorp/aws/latest/docs/resources/instance");

		const fallbackResult = tfresource.getLineMatchResultUri({
			type: "resource",
			range: new vscode.Range(0, 0, 0, 0),
			resourceType: "unknown_resource",
			dataOrResource: "resource"
		}, undefined, config);

		assert.strictEqual(fallbackResult?.toString(), "https://search.opentofu.org/provider/hashicorp/unknown/latest/docs/resources/resource");
	});

	test('module:getLineMatchResultUri should respect search.opentofu.org documentationRegistry', () => {
		const config = new MockConfig({
			'documentationRegistry': 'search.opentofu.org'
		}) as any as vscode.WorkspaceConfiguration;

		const result = tfmodule.getLineMatchResultUri({
			type: "module",
			range: new vscode.Range(0, 0, 0, 0),
			moduleSource: "terraform-aws-modules/vpc/aws",
		}, config);

		assert.strictEqual(result?.toString(), "https://search.opentofu.org/module/terraform-aws-modules/vpc/aws");

		const submoduleResult = tfmodule.getLineMatchResultUri({
			type: "module",
			range: new vscode.Range(0, 0, 0, 0),
			moduleSource: "terraform-aws-modules/iam/aws//modules/iam-assumable-role",
		}, config);

		assert.strictEqual(submoduleResult?.toString(), "https://search.opentofu.org/module/terraform-aws-modules/iam/aws/latest/submodules/iam-assumable-role");
	});
});
