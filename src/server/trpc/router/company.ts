import { z } from 'zod'

import { formatAWSfileUrl } from '@root/server/common'

import { createRbacProcedure, publicProcedure, router } from '../trpc'

export const companyProcedure = createRbacProcedure({
  requiredRoles: ['Admin'],
})

export const companyRouter = router({
  getCompany: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.company.findUnique({
        where: input,
        include: {
          photos: true,
        },
      })
    }),
  createCompany: companyProcedure
    .input(
      z.object({
        name: z.string(),
        cnpj: z.string(),
        stateSubscription: z.string(),
        contactPhone: z.string(),
        contactEmail: z.string().email(),
        workingHours: z.string(),
        cep: z.string(),
        photosFilenames: z.string().array().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.company.create({
        data: {
          name: input.name,
          cnpj: input.cnpj,
          stateSubscription: input.stateSubscription,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          workingHours: input.workingHours,
          address: {
            connectOrCreate: {
              where: {
                cep: input.cep,
              },
              create: {
                cep: input.cep,
              },
            },
          },
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
  updateCompany: companyProcedure
    .input(
      z.object({
        name: z.string(),
        cnpj: z.string().optional(),
        stateSubscription: z.string().optional(),
        contactPhone: z
          .string()

          .optional(),
        contactEmail: z.string().email().optional(),
        workingHours: z.string().optional(),
        cep: z
          .string()

          .optional(),
        photosFilenames: z.string().array().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.company.update({
        where: { name: input.name },
        data: {
          name: input.name,
          cnpj: input.cnpj,
          stateSubscription: input.stateSubscription,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          workingHours: input.workingHours,
          address: input.cep
            ? {
                connectOrCreate: {
                  where: {
                    cep: input.cep,
                  },
                  create: {
                    cep: input.cep,
                  },
                },
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
  deleteCompany: companyProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: delete photo from AWS before delete company

      return ctx.prisma.company.delete({
        where: input,
      })
    }),
})
