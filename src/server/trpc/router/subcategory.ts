import { z } from 'zod'

import { router } from '../trpc'

import { categoryProcedure } from './category'

export const subCategoryRouter = router({
  getAllSubCategories: categoryProcedure
    .input(
      z.object({
        categoryId: z.string(),
        name: z.string().optional(),
        // TODO: pagination
        // take: z.number().gte(0).optional(),
        // skip: z.number().gte(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.subCategory.findMany({
        where: {
          parentId: {
            equals: input.categoryId,
          },
          name: input.name
            ? {
                contains: input.name,
              }
            : undefined,
        },
      })
    }),
  createSubCategory: categoryProcedure
    .input(
      z.object({
        name: z.string(),
        parentId: z.string().cuid(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.subCategory.create({
        data: {
          name: input.name,
          parent: {
            connect: {
              id: input.parentId,
            },
          },
        },
      })
    }),
  updateSubCategory: categoryProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().optional(),
        visibility: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.subCategory.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          visibility: input.visibility,
        },
      })
    }),
  deleteSubCategory: categoryProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.subCategory.delete({
        where: input,
      })
    }),
})
