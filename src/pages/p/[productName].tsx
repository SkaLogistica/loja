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
  product?: inferProcedureOutput<AppRouter['product']['getProduct']>
  selectedUrl?: string
  callback?: (url: string) => void
}> = ({ product }) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    product?.photos[0]?.url
  )

  if (!product) return <></>

  return (
    <div className="flex gap-2">
      <ul className="carousel-vertical carousel h-96 max-w-sm gap-4 py-2">
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
      <div className="h-96 w-96">
        <Image
          src={photoUrl ?? ''}
          width={384}
          height={384}
          alt={`Imagem do produto ${product.name}`}
        />
      </div>
    </div>
  )
}

const ProductPage: NextPage = () => {
  const router = useRouter()
  const searchInputRef = useRef<string>('')
  const name = stringifyQueryParam(router.query.productName)

  const { data: productData } = trpc.product.getProduct.useQuery(
    {
      name,
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
          pathname: '/',
          query: {
            busca: searchInputRef.current,
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
        <div className="box-border flex w-full flex-col items-center gap-y-4">
          <div className="flex gap-4">
            <PhotosCarousel product={productData} />
            <div>
              <h2 className="text-3xl font-bold">{productData?.name}</h2>
              <p>{productData?.description}</p>
              <div className="flex flex-col items-end">
                <p className="text-xl font-bold">
                  {currencyFormatter(Number(productData?.price ?? 0))}
                </p>
              </div>
            </div>
          </div>
          <button className="btn-primary btn w-full max-w-2xl">Comprar</button>
        </div>
      </main>
    </StoreLayout>
  )
}

export default ProductPage
