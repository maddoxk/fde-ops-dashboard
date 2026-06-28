variable "region" {
  description = "AWS region for the S3 origin bucket."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name, used to derive resource names."
  type        = string
  default     = "fde-ops-dashboard"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)."
  type        = string
  default     = "prod"
}

variable "custom_domain" {
  description = "Optional custom domain (requires ACM cert + Route53; not wired in this stub)."
  type        = string
  default     = ""
}
