import { env } from '@root/env/server.mjs'

export function formatAWSfileUrl(filename: string) {
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${filename}`
}
