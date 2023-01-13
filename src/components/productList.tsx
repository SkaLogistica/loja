import type { inferProcedureOutput } from '@trpc/server'

import type { AppRouter } from '@root/server/trpc/router/_app'

import { ProductCard } from './productCard'

export const ProductList: React.FC<{
  data: inferProcedureOutput<AppRouter['product']['getAllProducts']>
}> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {data?.map((product) => (
        <ProductCard key={product.id} data={product} />
      ))}
    </div>
  )
}
