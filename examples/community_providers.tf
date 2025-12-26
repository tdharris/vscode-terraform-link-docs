terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    datadog = {
      source  = "datadog/datadog"
      version = "~> 3.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.69.1"
    }
  }
}

# Cloudflare Resource
resource "cloudflare_dns_record" "example_dns_record" {
  zone_id = "023e105f4ecef8ad9ca31a8372d0c353"
  name    = "example.com"
  ttl     = 3600
  type    = "A"
  comment = "Domain verification record"
  content = "198.51.100.4"
  proxied = true
  settings = {
    ipv4_only = true
    ipv6_only = true
  }
  tags = ["owner:dns-team"]
}

# DigitalOcean Resource
resource "digitalocean_droplet" "web" {
  image  = "ubuntu-20-04-x64"
  name   = "web-1"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
}

# Datadog Resource
resource "datadog_monitor" "cpumonitor" {
  name    = "cpu monitor"
  type    = "metric alert"
  message = "CPU is high"
  query   = "avg(last_1m):avg:system.cpu.system{host:host0} > 90"
}

# GitHub Resource (integrations namespace)
resource "github_repository" "example" {
  name        = "example-repo"
  description = "My awesome codebase"
  visibility  = "public"
}

# Proxmox Resource
resource "proxmox_virtual_environment_download_file" "example" {
  # ...
}
