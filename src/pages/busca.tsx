import { useState } from 'react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { useDebounce } from 'use-debounce'

import { PaginationButtonGroup, ProductList } from '@root/components'
import { StoreLayout } from '@root/layouts'
import { stringifyQueryParam, trpc } from '@root/utils'

const Busca: NextPage = () => {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState<string>(
    stringifyQueryParam(router.query.nome)
  )
  const [debouncedSearchInput] = useDebounce(searchInput, 1000)
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 12

  const { data: productsData } = trpc.product.all.useQuery(
    {
      name: debouncedSearchInput !== '' ? debouncedSearchInput : undefined,
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
            pathname: '/busca',
            query: {
              nome: e.target.value,
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

export default Busca
