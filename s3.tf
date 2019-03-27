# Configure the AWS Provider
provider "aws" {}

resource "aws_s3_bucket" "b" {
  bucket_prefix = "for-fluentd-demo2"
  acl           = "private"
  tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}

