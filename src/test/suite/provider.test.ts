import * as assert from 'assert';
import { parseProviders } from '../../terraform/provider.js';

suite('Provider Parser Test Suite', () => {
  test('should parse simple required_providers block', () => {
    const content = `
      terraform {
        required_providers {
          aws = {
            source = "hashicorp/aws"
            version = "~> 3.0"
          }
        }
      }
    `;
    const map = parseProviders(content);
    assert.strictEqual(map.get('aws'), 'hashicorp/aws');
  });

  test('should parse multiple providers', () => {
    const content = `
      terraform {
        required_providers {
          digitalocean = {
            source = "digitalocean/digitalocean"
          }
          cloudflare = {
            source = "cloudflare/cloudflare"
          }
        }
      }
    `;
    const map = parseProviders(content);
    assert.strictEqual(map.get('digitalocean'), 'digitalocean/digitalocean');
    assert.strictEqual(map.get('cloudflare'), 'cloudflare/cloudflare');
  });

  test('should ignore blocks without source', () => {
    const content = `
      terraform {
        required_providers {
          aws = {
            version = "~> 3.0"
          }
        }
      }
    `;
    const map = parseProviders(content);
    assert.strictEqual(map.has('aws'), false);
  });

  test('should not match data blocks or other resources', () => {
    const content = `
      data "aws_ami" "ubuntu" {
        most_recent = true
        filter {
          name   = "name"
          values = ["ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*"]
        }
        owners = ["099720109477"] # Canonical
      }

      resource "example_resource" "foo" {
        data = {
          source = "something"
        }
      }
    `;
    const map = parseProviders(content);
    assert.strictEqual(map.size, 0);
  });

  test('should handle complex formatting', () => {
    const content = `
      terraform { required_providers { mycloud = { source = "mycorp/mycloud" } } }
    `;
    const map = parseProviders(content);
    assert.strictEqual(map.get('mycloud'), 'mycorp/mycloud');
  });

  test('should handle multiple required_providers blocks', () => {
    const content = `
      terraform {
        required_providers {
          aws = {
            source = "hashicorp/aws"
          }
        }
      }

      terraform {
        required_providers {
          google = {
            source = "hashicorp/google"
          }
        }
      }
    `;
    const map = parseProviders(content);
    assert.strictEqual(map.get('aws'), 'hashicorp/aws');
    assert.strictEqual(map.get('google'), 'hashicorp/google');
  });
});
