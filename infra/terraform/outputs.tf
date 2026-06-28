output "bucket_name" {
  description = "Name of the S3 bucket hosting the built assets."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain (the public URL of the dashboard)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (use for cache invalidation on deploy)."
  value       = aws_cloudfront_distribution.site.id
}
