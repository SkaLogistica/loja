import { env } from '@root/env/server.mjs'

import { protectedProcedure, publicProcedure, router } from '../trpc'

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),
  getUserRole: protectedProcedure.query(async ({ ctx }) => {
    const userData = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    })

    return userData?.email === env.ADMIN_EMAIL ? 'Admin' : userData?.role
  }),
})
