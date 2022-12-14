import { Role } from '@prisma/client'
import { z } from 'zod'

import { createRbacProcedure, router } from '../trpc'

const userProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Moderator'],
})

export const userRouter = router({
  getAllUsers: userProcedure
    .input(
      z.object({
        name: z.string().optional(),
        roles: z.nativeEnum(Role).array().optional(),
        deleted: z.boolean().default(false),
        // TODO: pagination
        // take: z.number().gte(0).optional(),
        // skip: z.number().gte(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          name: {
            contains: input.name,
          },
          role: {
            in: input.roles,
          },
          deletedAt: input.deleted
            ? {
                not: {
                  equals: null,
                },
              }
            : {
                equals: null,
              },
        },
      })
    }),
  updateUser: userProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        active: z.boolean().optional(),
        role: z.nativeEnum(Role).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          active: input.active,
          role: input.role,
        },
      })
    }),
  deleteUser: userProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: input,
        data: {
          deletedAt: new Date(),
        },
      })
    }),
})
