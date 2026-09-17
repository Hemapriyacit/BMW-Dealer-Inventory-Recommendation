terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# --------------------------------------------------
# S3 Bucket
# --------------------------------------------------

resource "aws_s3_bucket" "inventory" {
  bucket = "bmw-dealer-inventory-recommendation-2026"

  tags = {
    Name        = "BMW Dealer Inventory Recommendation"
    Project     = "BMW Dealer Inventory Recommendation"
    Environment = "Development"
    ManagedBy   = "Terraform"
  }
}

# --------------------------------------------------
# S3 Bucket Versioning
# --------------------------------------------------

resource "aws_s3_bucket_versioning" "inventory" {
  bucket = aws_s3_bucket.inventory.id

  versioning_configuration {
    status = "Enabled"
  }
}

# --------------------------------------------------
# S3 Server-Side Encryption
# --------------------------------------------------

resource "aws_s3_bucket_server_side_encryption_configuration" "inventory" {
  bucket = aws_s3_bucket.inventory.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# --------------------------------------------------
# S3 Public Access Block
# --------------------------------------------------

resource "aws_s3_bucket_public_access_block" "inventory" {
  bucket = aws_s3_bucket.inventory.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}