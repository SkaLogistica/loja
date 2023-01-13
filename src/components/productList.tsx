import type { inferProcedureOutput } from '@trpc/server'

import type { AppRouter } from '@root/server/trpc/router/_app'

import { ProductCard } from './productCard'

/* TODO: add empty array UI */
export const ProductList: React.FC<{
  data?: inferProcedureOutput<AppRouter['product']['getAllProducts']>
}> = ({ data }) => {
  if (!data) return <></>

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3 xl:p-8">
      {data?.map((product) => (
        <ProductCard key={product.id} data={product} />
      ))}
    </div>
  )
}
