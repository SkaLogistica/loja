// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { Role } from '@prisma/client'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { env } from '../../../env/server.mjs'
import { prisma } from '../../../server/db/client'

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const userData = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
        })
        session.user.id = user.id
        session.user.role =
          user.email === env.ADMIN_EMAIL
            ? ('Admin' as Role)
            : userData?.role ?? ('User' as Role)
      }
      return session
    },
    async signIn({ user }) {
      if (user.email === env.ADMIN_EMAIL) return true

      const userData = await prisma.user.findUnique({
        where: {
          id: user.id
        },
      })

      const isAllowedToSignIn = !userData || userData.deletedAt !== null && userData.active === true

      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
}

export default NextAuth(authOptions)
