import { useState } from 'react'
import { type NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { StoreLayout } from '@root/layouts'
import { currencyFormatter, stringifyQueryParam, trpc } from '@root/utils'

const Home: NextPage = () => {
  const router = useRouter()
  const [name, setName] = useState(stringifyQueryParam(router.query.busca))
  const [page, setPage] = useState(0)
  const productsPerPage = 12

  const { data: productsData, refetch } = trpc.product.getAllProducts.useQuery(
    {
      name: name !== '' ? name : undefined,
      skip: page * productsPerPage,
      take: productsPerPage,
    },
    {
      staleTime: Infinity,
    }
  )

  const disableNextPage = productsData
    ? productsData.length < productsPerPage
    : false

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
                  <button
                    className="btn btn-primary"
                    onClick={() => router.push(`p/${product.name}`)}
                  >
                    Comprar
                  </button>
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
      </main>
    </StoreLayout>
  )
}

export default Home
