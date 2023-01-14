import { useRef } from 'react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'

import { ProductList } from '@root/components'
import { StoreLayout } from '@root/layouts'
import { trpc } from '@root/utils'

const Home: NextPage = () => {
  const router = useRouter()
  const searchInputRef = useRef<string>('')

  const { data: productsRankedByViews } = trpc.product.all.useQuery(
    {
      take: 10,
      orderBy: {
        views: 'desc',
      },
    },
    {
      staleTime: Infinity,
    }
  )

  const { data: productsRankedByPurchases } = trpc.product.all.useQuery(
    {
      take: 10,
      orderBy: {
        purchases: 'desc',
      },
    },
    {
      staleTime: Infinity,
    }
  )

  return (
    <StoreLayout
      searchSubmit={(e) => {
        e.preventDefault()
        router.push({
          pathname: '/busca',
          query: {
            nome: searchInputRef.current,
          },
        })
      }}
      searchOnChange={(e) => {
        searchInputRef.current = e.target.value
      }}
    >
      <main className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <h2 className="pt-4 text-xl font-bold">Produtos mais visitados</h2>
        <ProductList data={productsRankedByViews} />
        <h2 className="text-xl font-bold">Produtos mais comprados</h2>
        <ProductList data={productsRankedByPurchases} />
      </main>
    </StoreLayout>
  )
}

export default Home
