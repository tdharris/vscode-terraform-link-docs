# Terraform Link Docs

This extension adds provider links to resources and data blocks as well as module sources in your Terraform files.

## Demo

![Demo](https://raw.githubusercontent.com/tdharris/vscode-terraform-link-docs/master/assets/demo.gif)

## Features

### Provider Resources

1. Resource:

    ```hcl
    resource "resource_type" "name" {}
    ```
    ```
    https://www.terraform.io/docs/providers/provider/r/resource_type
    ```

2. Data:

    ```hcl
    data "data_type" "name" {}
    ```
    ```
    https://www.terraform.io/docs/providers/provider/d/resource_type
    ```

### Modules

Below are a couple generic examples of module sources and the resulting links. Other sources are supported as well, such as [Terraform Registry](https://www.terraform.io/docs/language/modules/sources.html#official-terraform-registry) and [Local Paths](https://www.terraform.io/docs/language/modules/sources.html#local-paths), etc.

#### Generic Git Repository

Git repositories that are used by prefixing the address with a special `git::` prefix. For more details, see [Generic Git Repository](https://developer.hashicorp.com/terraform/language/modules/sources#generic-git-repository).

1. Default branch (referenced by `HEAD`):

    ```hcl
    module "eks_cluster" {
      source = "git::git@github.com:owner/repo.git//modules/eks-cluster"
    }
    ```
    ```
    https://github.com/owner/repo/tree/HEAD/modules/eks-cluster
    ```

2. Selecting a Revision:

    ```hcl
    module "eks_cluster" {
      source = "git::git@github.com:owner/repo.git//modules/eks-cluster?ref=v0.0.1"
    }
    ```
    ```
    https://github.com/owner/repo/tree/v0.0.1/modules/eks-cluster
    ```