
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.100"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
}

data "aws_s3_bucket" "example" {
  bucket = aws_s3_bucket.example.bucket
}

resource "kubernetes_config_map" "example" {
  metadata {
    name = "my-config"
  }

  data = {
    api_host             = "myhost:443"
    db_host              = "dbhost:5432"
    "my_config_file.yml" = "${file("${path.module}/my_config_file.yml")}"
  }

  binary_data = {
    "my_payload.bin" = "${filebase64("${path.module}/my_payload.bin")}"
  }
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

module "iam_account" {
  source = "terraform-aws-modules/iam/aws//modules/iam-account"
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

module "example_gitlab" {
  source = "git::ssh://git@gitlab.com/namespace/path/to/repo.git//modules/name?ref=v0.0.1"
}
