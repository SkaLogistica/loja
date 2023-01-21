import type { inferProcedureOutput } from '@trpc/server'
import Image from 'next/image'

import type { AppRouter } from '@root/server/trpc/router/_app'

import { ProductCard } from './productCard'

const EmptyList: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/assets/undraw_no_data.svg"
        width={500}
        height={500}
        alt="Não há dados a serem exibidos"
        className="max-h-32"
      />
      <h3 className="text-sm font-bold">Não foram encontrados dados</h3>
      <span className="text-sm">Tente novamente mais tarde</span>
    </div>
  )
}

export const ProductList: React.FC<{
  data?: inferProcedureOutput<AppRouter['product']['all']>
}> = ({ data }) => {
  if (!data || data.length === 0) return <EmptyList />

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3 xl:p-8">
      {data.map((product) => (
        <ProductCard key={product.id} data={product} />
      ))}
    </div>
  )
}
