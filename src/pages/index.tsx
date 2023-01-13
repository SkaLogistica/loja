import { useState } from 'react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'

import { PaginationButtonGroup, ProductList } from '@root/components'
import { StoreLayout } from '@root/layouts'
import { stringifyQueryParam, trpc } from '@root/utils'

const Home: NextPage = () => {
  const router = useRouter()
  const [name, setName] = useState(stringifyQueryParam(router.query.busca))
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 12

  const { data: productsData, refetch } = trpc.product.getAllProducts.useQuery(
    {
      name: name !== '' ? name : undefined,
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

  if (!productsData) return <></>

  return (
    <StoreLayout
      defaultValue={name}
      searchSubmit={(e) => {
        e.preventDefault()
        refetch()
      }}
      searchOnChange={(e) => {
        setName(e.target.value)
      }}
    >
      <main className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <ProductList data={productsData} />
        <PaginationButtonGroup
          page={currentPage}
          dispatcher={setCurrentPage}
          disableNext={shouldDisableNextPage}
        />
      </main>
    </StoreLayout>
  )
}

export default Home
