import { router } from '../trpc'

import { authRouter } from './auth'
import { awsRouter } from './aws'
import { categoryRouter } from './category'
import { companyRouter } from './company'
import { photoRouter } from './photo'
import { productRouter } from './product'
import { subCategoryRouter } from './subcategory'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  aws: awsRouter,
  user: userRouter,
  category: categoryRouter,
  subCategory: subCategoryRouter,
  product: productRouter,
  photo: photoRouter,
  company: companyRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
