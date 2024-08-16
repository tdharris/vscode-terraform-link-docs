
resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
}

data "aws_s3_bucket" "example" {
  bucket = aws_s3_bucket.example.bucket
}

module "consul" {
  source = "hashicorp/consul/aws"
}

module "k8s_cluster" {
  source = "app.terraform.io/example-corp/k8s-cluster/azurerm"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
}

module "iam_assumable_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-assumable-role"
}

module "example_github" {
  source = "github.com/hashicorp/example"
}

module "example_git_ssh" {
  source = "git@github.com:hashicorp/example.git"
}

module "example_bitbucket" {
  source = "bitbucket.org/hashicorp/terraform-consul-aws"
}

module "storage_git_ssh" {
  source = "git::ssh://username@example.com/repo/storage.git"
}

module "storage_git_username" {
  source = "git::username@example.com:repo/storage.git"
}

module "example_git_ref" {
  source = "git::git@github.com:owner/repo.git//modules/name?ref=v0.0.1"
}

module "example_git_commit" {
  source = "git::git@github.com:owner/repo.git//modules/name?ref=51d462976d84fdea54b47d80dcabbf680badcdb8"
}

module "example_git_no_ref" {
  source = "git::git@github.com:owner/repo.git//modules/name"
}

module "example_git_tag" {
  source = "git@github.com:owner/repo.git?ref=v0.0.1"
}













