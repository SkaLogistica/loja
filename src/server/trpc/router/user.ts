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
        },
      })
    }),
})
