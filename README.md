# terraform-module-links README

This extension adds terraform module links to your editor when editing Terraform files.

Initially, this only supports module sources using a particular [Generic Git Repository](https://developer.hashicorp.com/terraform/language/modules/sources#generic-git-repository).

## Features

This extension will add a clickable link to the module source in the editor. Below are generic examples of the supported module sources and the resulting links.

### Generic Git Repository

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