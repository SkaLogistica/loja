import { Prisma } from '@prisma/client'
import isDecimal from 'validator/lib/isDecimal'
import { z } from 'zod'

import { formatAWSfileUrl } from '@root/server/common'

import { createRbacProcedure, publicProcedure, router } from '../trpc'

export const productProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Editor'],
})

export const productRouter = router({
  getAllProducts: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        categoryId: z.string().cuid().optional(),
        subCategoryId: z.string().cuid().optional(),
        take: z.number().gte(0).optional(),
        skip: z.number().gte(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where:
          input.name || input.categoryId || input.subCategoryId
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
              }
            : undefined,
        include: {
          category: true,
          subCategory: true,
          photos: true,
        },
        take: input.take,
        skip: input.skip,
      })
    }),
  getProduct: productProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.product.findUnique({
        where: input,
        include: {
          category: true,
          subCategory: true,
          photos: true,
        },
      })
    }),
  createProduct: productProcedure
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
  updateProduct: productProcedure
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
  deleteProduct: productProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: delete photo from AWS before delete product

      return ctx.prisma.product.delete({
        where: input,
      })
    }),
})
