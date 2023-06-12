# Local Paths
# https://developer.hashicorp.com/terraform/language/modules/sources#local-paths
module "consul" {
  source = "./consul"
}

# Terraform Registry
# https://developer.hashicorp.com/terraform/language/modules/sources#terraform-registry
module "consul" {
  source = "hashicorp/consul/aws"
  version = "0.1.0"
}

module "consul" {
  source = "app.terraform.io/example-corp/k8s-cluster/azurerm"
  version = "1.1.0"
}

# Github
# https://developer.hashicorp.com/terraform/language/modules/sources#github
module "consul" {
  source = "github.com/hashicorp/example"
}

module "consul" {
  source = "git@github.com:hashicorp/example.git"
}

# BitBucket
# https://developer.hashicorp.com/terraform/language/modules/sources#bitbucket
module "consul" {
  source = "bitbucket.org/hashicorp/terraform-consul-aws"
}

# Generic Git repositories
# https://developer.hashicorp.com/terraform/language/modules/sources#generic-git-repository
module "vpc" {
  source = "git::https://example.com/vpc.git"
}

module "storage" {
  source = "git::ssh://username@example.com/storage.git"
}

# select a specific tag
module "vpc" {
  source = "git::https://example.com/vpc.git?ref=v1.2.0"
}

# directly select a commit using its SHA-1 hash
module "storage" {
  source = "git::https://example.com/storage.git?ref=51d462976d84fdea54b47d80dcabbf680badcdb8"
}

# "scp-like" address syntax
module "storage" {
  source = "git::username@example.com:storage.git"
}

# Generic Mercurial repositories 
# https://developer.hashicorp.com/terraform/language/modules/sources#generic-mercurial-repository
module "vpc" {
  source = "hg::http://example.com/vpc.hg"
}

module "vpc" {
  source = "hg::http://example.com/vpc.hg?ref=v1.2.0"
}

# HTTP URLs
# https://developer.hashicorp.com/terraform/language/modules/sources#http-urls
module "vpc" {
  source = "https://example.com/vpc-module.zip"
}

module "vpc" {
  source = "https://example.com/vpc-module?archive=zip"
}

# S3 Buckets
# https://developer.hashicorp.com/terraform/language/modules/sources#s3-bucket
module "consul" {
  source = "s3::https://s3-eu-west-1.amazonaws.com/examplecorp-terraform-modules/vpc.zip"
}

# GCS Buckets
# https://developer.hashicorp.com/terraform/language/modules/sources#gcs-bucket
module "consul" {
  source = "gcs::https://www.googleapis.com/storage/v1/modules/foomodule.zip"
}

# Module in Package Sub-directories
# https://developer.hashicorp.com/terraform/language/modules/sources#modules-in-package-sub-directories
# TODO



# Other examples
module "eks_cluster" {
  source = "git::git@github.com:gruntwork-io/terraform-aws-eks.git//modules/eks-cluster-control-plane?ref=v0.43.0"

  cluster_name = var.cluster_name

  vpc_id                       = data.terraform_remote_state.vpc.outputs.vpc_id
  vpc_control_plane_subnet_ids = local.control_plane_subnet_ids

  enabled_cluster_log_types    = ["api", "audit", "authenticator"]
  kubernetes_version           = var.kubernetes_version
  endpoint_public_access       = var.endpoint_public_access
  endpoint_public_access_cidrs = var.endpoint_public_access_cidrs

  custom_tags_eks_cluster    = var.custom_tags
  custom_tags_security_group = var.custom_tags
}

module "eks_cluster" {
  source = "git::git@github.com:gruntwork-io/terraform-aws-eks.git//modules/eks-cluster-control-plane"

  cluster_name = var.cluster_name

  vpc_id                       = data.terraform_remote_state.vpc.outputs.vpc_id
  vpc_control_plane_subnet_ids = local.control_plane_subnet_ids

  enabled_cluster_log_types    = ["api", "audit", "authenticator"]
  kubernetes_version           = var.kubernetes_version
  endpoint_public_access       = var.endpoint_public_access
  endpoint_public_access_cidrs = var.endpoint_public_access_cidrs

  custom_tags_eks_cluster    = var.custom_tags
  custom_tags_security_group = var.custom_tags
}

module "consul" {
  source = "hashicorp/consul/aws"
  version = "0.1.0"
}

module "consul" {
  source = "app.terraform.io/example-corp/k8s-cluster/azurerm"
  version = "1.1.0"
}

module "consul" {
  source = "github.com/hashicorp/example"
}

module "consul" {
  source = "git@github.com:hashicorp/example.git"
}

module "consul" {
  source = "bitbucket.org/hashicorp/terraform-consul-aws"
}

module "vpc" {
  source = "git::https://example.com/vpc.git"
}

module "storage" {
  source = "git::ssh://username@example.com/storage.git"
}

module "dms_example_complete" {
  source  = "terraform-aws-modules/dms/aws//examples/complete"
  version = "1.6.1"
}

resource "aws_iam_role" "iam_role" {
  name               = "iam-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}