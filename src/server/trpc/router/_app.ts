import { router } from '../trpc'

import { authRouter } from './auth'
import { awsRouter } from './aws'
import { categoryRouter } from './category'
import { subCategoryRouter } from './subcategory'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  aws: awsRouter,
  user: userRouter,
  category: categoryRouter,
  subCategory: subCategoryRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
