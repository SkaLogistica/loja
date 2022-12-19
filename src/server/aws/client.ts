import { S3Client } from '@aws-sdk/client-s3'

import { env } from '@root/env/server.mjs'

declare global {
  // eslint-disable-next-line no-var
  var s3Client: S3Client | undefined // eslint-disable-line vars-on-top
}

export const s3Client =
  global.s3Client ||
  new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  })

if (env.NODE_ENV !== 'production') {
  global.s3Client = s3Client
}