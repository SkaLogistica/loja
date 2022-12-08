import type { Role } from '@prisma/client'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'

import { env } from '@root/env/server.mjs'

import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

const has = (roles: Role[]) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    })

    /* NOTE: ADMIN default email has super user capabilities beyond roles */
    if (user?.email === env.ADMIN_EMAIL) {
      return next()
    }

    if (!roles.includes(user?.role ?? 'User')) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next()
  })

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed)

export const createRbacProcedure = ({
  requiredRoles,
}: {
  requiredRoles: Role[]
}) => protectedProcedure.use(has(requiredRoles))
