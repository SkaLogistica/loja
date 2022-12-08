/**
 * Original code from Shubham Verma
 * SOURCE: https://blogs.shubhamverma.me/implement-protected-routes-in-nextjs
 */
import { useEffect } from 'react'
import type { Role } from '@prisma/client'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

import { trpc } from './trpc'

export const withAuth = (WrappedComponent: NextPage, allowedRoles?: Role[]) => {
  return function AuthedWrapper() {
    const Router = useRouter()
    const { status, data: sessionData } = useSession()
    const { data: userRole } = trpc.auth.getUserRole.useQuery(undefined, {
      enabled: allowedRoles && sessionData?.user !== undefined,
    })

    useEffect(() => {
      // If there is no access token we redirect to "/" page.
      if (
        status === 'unauthenticated' ||
        (allowedRoles && !allowedRoles.includes(userRole ?? 'User'))
      ) {
        Router.replace('/')
      }
    }, [userRole, Router, status])

    return <WrappedComponent />
  }
}
