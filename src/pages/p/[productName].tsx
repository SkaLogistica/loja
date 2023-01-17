import { useRef, useState } from 'react'
import type { inferProcedureOutput } from '@trpc/server'
import { type NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Breadcrumbs } from '@root/components'
import { StoreLayout } from '@root/layouts'
import type { AppRouter } from '@root/server/trpc/router/_app'
import { currencyFormatter, stringifyQueryParam, trpc } from '@root/utils'

const PhotosCarousel: React.FC<{
  product?: inferProcedureOutput<AppRouter['product']['get']>
  selectedUrl?: string
  callback?: (url: string) => void
}> = ({ product }) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    product?.photos[0]?.url
  )

  if (!product) return <></>

  return (
    <div className="flex flex-col-reverse gap-2 md:flex-row ">
      <ul className="carousel gap-4 py-2 md:h-96 md:carousel-vertical">
        {product.photos.map((photo) => (
          <li key={photo.id} className="carousel-item">
            <button
              className={`btn h-16 w-16 ${
                photoUrl === photo.url
                  ? 'btn-disabled border-primary'
                  : 'btn-outline'
              }`}
              onClick={() => setPhotoUrl(photo.url)}
            >
              <Image
                src={photo.url}
                className="h-8 w-8"
                width={32}
                height={32}
                alt={`Imagem do produto ${product.name}`}
              />
            </button>
          </li>
        ))}
      </ul>
      <Image
        src={photoUrl ?? ''}
        width={384}
        height={384}
        alt={`Imagem do produto ${product.name}`}
        className="h-[15rem] w-[15rem] md:h-96 md:w-96 "
      />
    </div>
  )
}

const ActionButtonGroup: React.FC<{
  className?: string
  callback: () => void
}> = ({ callback, className }) => {
  return (
    <div className={`w-full flex-col items-center gap-y-4 ${className}`}>
      <button
        className="btn-primary btn w-full max-w-xs md:max-w-xl"
        onClick={callback}
      >
        Comprar
      </button>
    </div>
  )
}

const ProductPage: NextPage = () => {
  const router = useRouter()
  const searchInputRef = useRef<string>('')
  const name = stringifyQueryParam(router.query.productName)

  const { data: productData } = trpc.product.get.useQuery(
    {
      name,
    },
    {
      staleTime: Infinity,
    }
  )

  const { mutate } = trpc.product.buy.useMutation()

  const buyProduct = () => mutate({ id: productData?.id ?? '' })

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
      <main className="mt-4 flex w-full flex-1 flex-col items-center gap-y-4 md:items-start md:px-9 lg:px-24">
        <Breadcrumbs
          category={productData?.category?.name}
          subCategory={productData?.subCategory?.name}
        />
        <div className="box-border flex w-full flex-col items-center gap-y-4 md:items-start">
          <div className="flex w-full flex-col items-center md:flex-row md:items-start">
            <h2 className="text-3xl font-bold md:hidden">
              {productData?.name}
            </h2>
            <PhotosCarousel product={productData} />
            <div className="flex h-full flex-1 flex-col items-center justify-between px-4 lg:px-8 xl:px-16">
              <div className="flex w-full flex-col">
                <h2 className="hidden text-3xl font-bold md:block">
                  {productData?.name}
                </h2>
                <p>{productData?.description}</p>
                <div className="flex w-full flex-col items-end">
                  <p className="text-3xl font-bold md:text-xl">
                    {currencyFormatter(Number(productData?.price ?? 0))}
                  </p>
                </div>
              </div>
              <ActionButtonGroup
                callback={buyProduct}
                className="hidden md:flex"
              />
            </div>
            <ActionButtonGroup
              callback={buyProduct}
              className="flex md:hidden"
            />
          </div>
        </div>
      </main>
    </StoreLayout>
  )
}

export default ProductPage
