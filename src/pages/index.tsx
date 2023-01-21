import { useRef } from 'react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'

import { ProductList } from '@root/components'
import { StoreLayout } from '@root/layouts'
import { trpc } from '@root/utils'

const SessionHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="sticky top-28 z-10 flex w-full items-center justify-center md:top-32 lg:top-36">
      <h2 className="max-w-fit rounded-full bg-orange-100 p-2 text-xl font-bold">
        {title}
      </h2>
    </div>
  )
}

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
        <SessionHeader title="Produtos mais visitados" />
        <ProductList data={productsRankedByViews} />
        <SessionHeader title="Produtos mais comprados" />
        <ProductList data={productsRankedByPurchases} />
      </main>
    </StoreLayout>
  )
}

export default Home
