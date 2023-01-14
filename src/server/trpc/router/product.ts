import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import isDecimal from 'validator/lib/isDecimal'
import { z } from 'zod'

import { formatAWSfileUrl } from '@root/server/common'

import { createRbacProcedure, publicProcedure, router } from '../trpc'

export const productProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Editor'],
})

export const productRouter = router({
  all: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        categoryId: z.string().cuid().optional(),
        subCategoryId: z.string().cuid().optional(),
        category: z.string().optional(),
        subCategory: z.string().optional(),
        take: z.number().gte(0).optional(),
        skip: z.number().gte(0).optional(),
        orderBy: z
          .object({
            views: z.enum(['asc', 'desc']).optional(),
            purchases: z.enum(['asc', 'desc']).optional(),
          })
          .optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where:
          input.name ||
          input.categoryId ||
          input.subCategoryId ||
          input.category ||
          input.subCategory
            ? {
                name: input.name
                  ? {
                      contains: input.name,
                    }
                  : undefined,
                categoryId: input.categoryId
                  ? {
                      equals: input.categoryId,
                    }
                  : undefined,
                subCategoryId: input.subCategoryId
                  ? {
                      equals: input.subCategoryId,
                    }
                  : undefined,
                category: input.category
                  ? {
                      name: {
                        equals: input.category,
                      },
                    }
                  : undefined,
                subCategory: input.subCategory
                  ? {
                      name: {
                        equals: input.subCategory,
                      },
                    }
                  : undefined,
              }
            : undefined,
        include: {
          category: true,
          subCategory: true,
          photos: true,
        },
        take: input.take,
        skip: input.skip,
        orderBy: input.orderBy,
      })
    }),
  get: publicProcedure
    .input(
      z
        .object({
          id: z.string().cuid(),
          name: z.undefined(),
          view: z.boolean().default(false),
        })
        .or(
          z.object({
            id: z.undefined(),
            name: z.string(),
            view: z.boolean().default(true),
          })
        )
    )
    .query(async ({ ctx, input: { view, ...input } }) => {
      const product = await ctx.prisma.product.findUnique({
        where: input,
        include: {
          category: true,
          subCategory: true,
          photos: true,
        },
      })

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      if (view) {
        await ctx.prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            views: {
              increment: 1,
            },
          },
        })
      }

      return product
    }),
  buy: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => {
      try {
        return ctx.prisma.product.update({
          where: input,
          data: {
            purchases: {
              increment: 1,
            },
          },
        })
      } catch (error) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
    }),
  create: productProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        available: z.boolean().optional(),
        hiddenPrice: z.boolean().optional(),
        visibility: z.boolean().optional(),
        price: z
          .string()
          .refine(
            (value) =>
              isDecimal(value, {
                decimal_digits: '1,3',
                locale: 'pt-BR',
              }),
            {
              message: 'Invalid decimal value',
            }
          )
          .optional(),
        categoryId: z.string().cuid().optional(),
        subCategoryId: z.string().cuid().optional(),
        photosFilenames: z.string().array().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: {
          name: input.name,
          price: input.price ? new Prisma.Decimal(input.price) : undefined,
          description: input.description,
          available: input.available,
          hiddenPrice: input.hiddenPrice,
          visibility: input.visibility,
          category: input.categoryId
            ? {
                connect: { id: input.categoryId },
              }
            : undefined,
          subCategory: input.subCategoryId
            ? {
                connect: { id: input.subCategoryId },
              }
            : undefined,
          photos: input.photosFilenames
            ? {
                createMany: {
                  data: input.photosFilenames.map((filename) => ({
                    url: formatAWSfileUrl(filename),
                    name: filename,
                  })),
                },
              }
            : undefined,
        },
      })
    }),
  update: productProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        available: z.boolean().optional(),
        hiddenPrice: z.boolean().optional(),
        visibility: z.boolean().optional(),
        price: z
          .string()
          .refine(
            (value) =>
              isDecimal(value, {
                force_decimal: false,
                decimal_digits: '1,3',
                locale: 'en-US',
              }),
            {
              message: 'Invalid decimal value',
            }
          )
          .optional(),
        categoryId: z.string().cuid().optional(),
        subcategoryId: z.string().cuid().optional(),
        photosFilenames: z.string().array().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          price: input.price ? new Prisma.Decimal(input.price) : undefined,
          description: input.description,
          available: input.available,
          hiddenPrice: input.hiddenPrice,
          visibility: input.visibility,
          category: input.categoryId
            ? {
                connect: { id: input.categoryId },
              }
            : undefined,
          subCategory: input.subcategoryId
            ? {
                connect: { id: input.subcategoryId },
              }
            : undefined,
          photos: input.photosFilenames
            ? {
                createMany: {
                  data: input.photosFilenames.map((filename) => ({
                    url: formatAWSfileUrl(filename),
                    name: filename,
                  })),
                },
              }
            : undefined,
        },
      })
    }),
  delete: productProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: delete photo from AWS before delete product

      return ctx.prisma.product.delete({
        where: input,
      })
    }),
})
