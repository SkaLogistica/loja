import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { env } from '@root/env/server.mjs'

import { createRbacProcedure, router } from '../trpc'

export const photoProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Editor'],
})

export const photoRouter = router({
  deletePhoto: photoProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.findUnique({
        where: input,
      })

      if (photo === null) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const command = new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: photo.name,
      })

      return ctx.s3Client
        .send(command)
        .then(() =>
          ctx.prisma.photo.delete({
            where: input,
          })
        )
        .catch((error) => {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: (error as Error).message,
          })
        })
    }),
})
