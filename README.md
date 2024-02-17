# Terraform Link Docs

This extension adds provider links to resources and data blocks as well as module sources in your Terraform files.

## Demo

![Demo](https://raw.githubusercontent.com/tdharris/vscode-terraform-link-docs/master/assets/demo.gif)

## Features

### Provider Resources

Below are generic examples of a resource and data block where appropriate links are added.

```hcl
resource "resource_type" "name" {}
```
```hcl
data "data_type" "name" {}
```

### Modules

Below are generic examples of module sources where appropriate links are added.

#### [Local Paths](https://developer.hashicorp.com/terraform/language/modules/sources#local-paths)

```hcl
module "consul" {
  source = "./consul"
}
```

#### [Terraform Registry](https://developer.hashicorp.com/terraform/language/modules/sources#terraform-registry)

```hcl
module "consul" {
  source = "hashicorp/consul/aws"
  version = "0.1.0"
}

module "consul" {
  source = "app.terraform.io/example-corp/k8s-cluster/azurerm"
  version = "1.1.0"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
}

# Submodules
module "" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role"
  version = "5.33.1"
}
```

#### [Github](https://developer.hashicorp.com/terraform/language/modules/sources#github)

```hcl
module "consul" {
  source = "github.com/hashicorp/example"
}

module "consul" {
  source = "git@github.com:hashicorp/example.git"
}
```

#### [Generic Git Repository](https://developer.hashicorp.com/terraform/language/modules/sources#generic-git-repository)

```hcl
module "eks_cluster" {
  source = "git::git@github.com:owner/repo.git//modules/eks-cluster"
}

# select a revision
module "eks_cluster" {
  source = "git::git@github.com:owner/repo.git//modules/eks-cluster?ref=v0.0.1"
}

# directly select a commit using its SHA-1 hash
module "eks_cluster" {
  source = "git::git@github.com:owner/repo.git//modules/eks-cluster?ref=51d462976d84fdea54b47d80dcabbf680badcdb8"
}

# "scp-like" address syntax
module "storage" {
  source = "git::username@example.com:repo/storage.git"
}
```

#### [Bitbucket](https://developer.hashicorp.com/terraform/language/modules/sources#bitbucket)

```hcl
module "consul" {
  source = "bitbucket.org/hashicorp/terraform-consul-aws"
}
```
