# terraform-doc-links README

This extension adds links to resources and modules in your editor when editing Terraform files.

## Features

This extension will add a link to provider resource and data blocks as well as module sources in your Terraform files.

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

Below are generic examples of the supported module sources and the resulting links.

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