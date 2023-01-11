import { useState } from 'react'
import { type NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { StoreLayout } from '@root/layouts'
import { currencyFormatter, stringifyQueryParam, trpc } from '@root/utils'

const SubCategoryPage: NextPage = () => {
  const router = useRouter()
  const category = stringifyQueryParam(router.query.category)
  const subCategory = stringifyQueryParam(router.query.subCategory)

  const [categoryBannerUrl, setBannerUrl] = useState('')
  const [name, setName] = useState('')
  const [page, setPage] = useState(0)
  const productsPerPage = 12

  const { data: productsData, refetch } = trpc.product.getAllProducts.useQuery(
    {
      name: name !== '' ? name : undefined,
      category,
      subCategory,
      skip: page * productsPerPage,
      take: productsPerPage,
    },
    {
      onSuccess: (products) => {
        if (products.length > 0) {
          setBannerUrl(products[0]?.category?.bannerUrl ?? '')
        }
      },
      staleTime: Infinity,
    }
  )

  const disableNextPage = productsData
    ? productsData.length < productsPerPage
    : false

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
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">Página Inicial</Link>
            </li>
            <li>
              <Link href={`/${category}`}>{category}</Link>
            </li>
            <li>
              <Link href={`/${category}/${subCategory}`}>{subCategory}</Link>
            </li>
          </ul>
        </div>
        <Image
          width={400}
          height={400}
          src={categoryBannerUrl}
          alt={`Banner da categoria ${category}`}
          className="hidden max-h-44 w-full md:block"
        />
        <div className="box-border flex w-full flex-col items-center gap-y-4">
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {productsData?.map((product) => (
              <div
                key={product.id}
                className="card border bg-base-100 shadow-xl lg:card-side"
              >
                {product.photos.length > 0 ? (
                  <figure>
                    <Image
                      width={256}
                      height={256}
                      src={product.photos[0]?.url ?? ''}
                      alt={`Imagem do ${product.name}`}
                      className="w-36 object-contain lg:w-64"
                    />
                  </figure>
                ) : (
                  <></>
                )}
                <div className="card-body">
                  <h2 className="card-title">{product.name}</h2>
                  <p>{currencyFormatter(Number(product.price))}</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">Comprar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-group grid grid-cols-3">
            <button
              className="btn btn-ghost"
              disabled={!page}
              onClick={() => setPage((old) => Math.max(0, old - 1))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="192"
                height="192"
                fill="#000000"
                viewBox="0 0 256 256"
                className="h-4 w-4"
              >
                <rect width="256" height="256" fill="none"></rect>
                <polyline
                  points="160 208 80 128 160 48"
                  fill="none"
                  stroke="#000000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="16"
                ></polyline>
              </svg>
            </button>
            <div className="flex cursor-not-allowed items-center justify-center bg-primary/30">
              {page + 1}
            </div>
            <button
              className="btn btn-ghost"
              disabled={disableNextPage}
              onClick={() => setPage((old) => old + 1)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="192"
                height="192"
                fill="#000000"
                viewBox="0 0 256 256"
                className="h-4 w-4"
              >
                <rect width="256" height="256" fill="none"></rect>
                <polyline
                  points="96 48 176 128 96 208"
                  fill="none"
                  stroke="#000000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="16"
                ></polyline>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </StoreLayout>
  )
}

export default SubCategoryPage
