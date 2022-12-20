import { env } from '@root/env/server.mjs'

export function formatAWSfileUrl(filename: string) {
  return `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/${filename}`
}
