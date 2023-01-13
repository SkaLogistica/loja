import { useState } from 'react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'

import {
  Breadcrumbs,
  CategoryBanner,
  PaginationButtonGroup,
  ProductList,
} from '@root/components'
import { StoreLayout } from '@root/layouts'
import { stringifyQueryParam, trpc } from '@root/utils'

const CategoryPage: NextPage = () => {
  const router = useRouter()
  const category = stringifyQueryParam(router.query.category)

  const [name, setName] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 12

  const { data: productsData, refetch } = trpc.product.getAllProducts.useQuery(
    {
      name: name !== '' ? name : undefined,
      category,
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
      searchSubmit={(e) => {
        e.preventDefault()
        refetch()
      }}
      searchOnChange={(e) => {
        setName(e.target.value)
      }}
    >
      <main className="mt-4 flex w-full flex-1 flex-col items-center gap-y-4 md:items-start md:px-9 lg:px-24">
        <Breadcrumbs category={category} />
        <CategoryBanner name={category} />
        <div className="box-border flex w-full flex-col items-center gap-y-4">
          <ProductList data={productsData} />
          <PaginationButtonGroup
            page={currentPage}
            dispatcher={setCurrentPage}
            disableNext={shouldDisableNextPage}
          />
        </div>
      </main>
    </StoreLayout>
  )
}

export default CategoryPage
