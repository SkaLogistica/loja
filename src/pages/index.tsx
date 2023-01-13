import { useState } from 'react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'

import { PaginationButtonGroup, ProductList } from '@root/components'
import { StoreLayout } from '@root/layouts'
import { stringifyQueryParam, trpc } from '@root/utils'

const Home: NextPage = () => {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState<string>(
    stringifyQueryParam(router.query.busca)
  )
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 12

  const { data: productsData } = trpc.product.getAllProducts.useQuery(
    {
      name: searchInput !== '' ? searchInput : undefined,
      skip: currentPage * productsPerPage,
      take: productsPerPage,
    },
    {
      staleTime: Infinity,
    }
  )

  const shouldDisableNextPage = productsData
    ? productsData.length < productsPerPage
    : false

  return (
    <StoreLayout
      defaultValue={searchInput}
      searchSubmit={(e) => {
        e.preventDefault()
      }}
      searchOnChange={(e) => {
        setSearchInput(e.target.value)
        router.push(
          {
            pathname: '/',
            query: {
              busca: e.target.value,
            },
          },
          undefined,
          { shallow: true }
        )
      }}
    >
      <main className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <ProductList data={productsData} />
        <PaginationButtonGroup
          hidden={productsData === undefined || productsData?.length === 0}
          page={currentPage}
          dispatcher={setCurrentPage}
          disableNext={shouldDisableNextPage}
        />
      </main>
    </StoreLayout>
  )
}

export default Home
