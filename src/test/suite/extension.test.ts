import * as assert from 'assert';
import * as vscode from 'vscode';
// import * as tfresource from '../../terraform/resource';
import * as tfmodule from '../../terraform/module';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

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
});
