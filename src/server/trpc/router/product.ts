import { Prisma } from '@prisma/client'
import isDecimal from 'validator/lib/isDecimal'
import { z } from 'zod'

import { formatAWSfileUrl } from '@root/server/common'

import { createRbacProcedure, router } from '../trpc'

export const productProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Editor'],
})

export const productRouter = router({
  getAllProducts: productProcedure
    .input(
      z.object({
        name: z.string().optional(),
        // categories: z.string().array().optional(),
        // subcategories: z.string().array().optional(),
        // TODO: pagination
        // take: z.number().gte(0).optional(),
        // skip: z.number().gte(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: input.name
          ? {
              name: {
                contains: input.name,
              },
            }
          : undefined,
        include: {
          category: true,
          subcategories: true,
        },
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
          subcategories: true,
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
        subcategoriesIds: z.string().cuid().array().optional(),
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
          subcategories: input.subcategoriesIds
            ? {
                connect: input.subcategoriesIds.map((id) => ({ id })),
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
        subcategoriesIds: z.string().cuid().array().optional(),
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
          subcategories: input.subcategoriesIds
            ? {
                connect: input.subcategoriesIds.map((id) => ({ id })),
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
