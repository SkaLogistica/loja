import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { formatAWSfileUrl } from '@root/server/common'

import { createRbacProcedure, publicProcedure, router } from '../trpc'

export const categoryProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Editor'],
})

export const categoryRouter = router({
  getAllCategories: publicProcedure
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
        where: input.name
          ? {
              name: {
                contains: input.name,
              },
            }
          : undefined,
        include: {
          subcategories: true,
        },
      })
    }),
  bannerUrl: publicProcedure
    .input(
      z
        .object({
          id: z.string().cuid(),
        })
        .or(
          z.object({
            name: z.string(),
          })
        )
    )
    .query(async ({ ctx, input }) => {
      try {
        const { bannerUrl } = await ctx.prisma.category.findUniqueOrThrow({
          where: input,
        })
        return bannerUrl
      } catch (error) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
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
