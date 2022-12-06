import { env } from '../../../env/server.mjs'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),
  getUserRole: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const userData = await ctx.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (
      userData &&
      userData.email === env.ADMIN_EMAIL &&
      userData.role === 'User'
    ) {
      const updatedData = await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          role: {
            set: 'Admin',
          },
        },
      })
      return updatedData.role
    }

    return userData?.role
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!'
  }),
})
