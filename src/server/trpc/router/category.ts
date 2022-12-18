import { z } from 'zod'

import { env } from '@root/env/server.mjs'

import { createRbacProcedure, router } from '../trpc'

const categoryProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Editor'],
})

function formatAWSfileUrl(filename: string) {
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${filename}`
}

export const categoryRouter = router({
  getAllCategories: categoryProcedure
    .input(
      z.object({
        name: z.string().optional(),
        // TODO: pagination
        // take: z.number().gte(0).optional(),
        // skip: z.number().gte(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.category.findMany({
        where: {
          name: input.name
            ? {
                contains: input.name,
              }
            : undefined,
        },
      })
    }),
  createCategory: categoryProcedure
    .input(
      z.object({
        name: z.string(),
        bannerFileName: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: {
          name: input.name,
          bannerUrl: formatAWSfileUrl(input.bannerFileName),
        },
      })
    }),
  updateCategory: categoryProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().optional(),
        bannerFileName: z.string().optional(),
        visibility: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          bannerUrl: input.bannerFileName
            ? formatAWSfileUrl(input.bannerFileName)
            : undefined,
          visibility: input.visibility,
        },
      })
    }),
  deleteCategory: categoryProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: delete photo from AWS before delete category

      return ctx.prisma.category.delete({
        where: input,
      })
    }),
})
