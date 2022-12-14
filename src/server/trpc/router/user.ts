import { Role } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRbacProcedure, router } from '../trpc'

const userProcedure = createRbacProcedure({
  requiredRoles: ['Admin', 'Moderator'],
})

enum RoleOrder {
  Admin,
  Editor,
  Moderator,
  User,
}

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
          id: {
            not: {
              equals: ctx.session?.user?.id,
            },
          },
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
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      })

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      /* is user changing self? */
      if (input.id === user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
      /* is user attempting to give role greater than self? */
      if (input.role && RoleOrder[user.role] > RoleOrder[input.role]) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

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
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session?.user?.id },
      })

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      /* is user changing self? */
      if (input.id === user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return ctx.prisma.user.update({
        where: input,
        data: {
          deletedAt: new Date(),
        },
      })
    }),
})
