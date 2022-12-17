import { router } from '../trpc'

import { authRouter } from './auth'
import { categoryRouter } from './category'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  category: categoryRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
