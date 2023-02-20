import { useRef, useState } from 'react'
import type { inferProcedureOutput } from '@trpc/server'
import { type NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Breadcrumbs, ProductList } from '@root/components'
import { env } from '@root/env/client.mjs'
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

const Button: React.FC<{
  children: string
  callback?: () => void
  disabled?: boolean
}> = ({ children, callback, disabled = false }) => {
  return (
    <button
      className="btn-primary btn w-full max-w-xs md:max-w-xl"
      onClick={callback}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const WhatsAppBuyButton: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({ className, ...props }) => {
  const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      width="16"
      height="16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.547 11.828a7.492 7.492 0 1 1 2.625 2.625l-2.594.734a.617.617 0 0 1-.765-.765l.734-2.594Z"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="m12.168 9.634-.007.054c-1.557-.777-1.72-.88-1.922-.578-.14.209-.546.683-.668.823-.124.138-.247.149-.458.053-.212-.106-.894-.33-1.702-1.052-.629-.563-1.051-1.254-1.176-1.466-.207-.359.227-.41.622-1.158.07-.148.035-.265-.018-.37-.053-.107-.476-1.148-.653-1.563-.17-.414-.345-.362-.476-.362-.408-.035-.706-.03-.969.244-1.143 1.257-.855 2.553.124 3.931 1.922 2.516 2.946 2.98 4.82 3.623.505.16.966.138 1.33.085.407-.064 1.252-.51 1.429-1.01.18-.5.18-.913.127-1.01-.052-.095-.191-.148-.403-.244Z"
        fill="#000"
      />
    </svg>
  )

  return (
    <a
      className={`btn-outline btn w-full max-w-xs text-green-500 hover:border-green-500 hover:bg-gray-100 hover:text-green-500 md:max-w-xl ${className}`}
      {...props}
    >
      <WhatsAppIcon className="mr-2" />
      Comprar no WhatsApp
    </a>
  )
}

function createWhatsAppMessage({
  product,
}: {
  product?: inferProcedureOutput<AppRouter['product']['get']>
}) {
  return encodeURI(
    `Olá, Me interessei pelo produto: ${product?.name ?? 'produto inválido'}`
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

  const { data: productsData } = trpc.product.all.useQuery(
    {
      category: productData?.category?.name,
      take: 10,
    },
    {
      staleTime: Infinity,
    }
  )

  const buyProduct = () => mutate({ id: productData?.id ?? '' })
  const whatsAppProductUrl = `https://wa.me/${
    env.NEXT_PUBLIC_PHONE
  }?text=${createWhatsAppMessage({
    product: productData,
  })}`

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
                <p className="break-words w-52 md:w-1/6">{productData?.description}</p>
              </div>
              <div className="hidden w-full flex-col items-center gap-y-4 md:flex">
                <div className="flex w-full flex-col items-end">
                  <p className="text-3xl font-bold">
                    {currencyFormatter(Number(productData?.price ?? 0))}
                  </p>
                </div>
                <WhatsAppBuyButton
                  href={whatsAppProductUrl}
                  onClick={buyProduct}
                />
                <Button disabled>Adicionar ao Carrinho</Button>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-y-4 md:hidden">
              <p className="text-4xl font-bold">
                {currencyFormatter(Number(productData?.price ?? 0))}
              </p>
              <WhatsAppBuyButton
                href={whatsAppProductUrl}
                onClick={buyProduct}
              />
              <Button disabled>Adicionar ao Carrinho</Button>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-2 p-4 md:items-start md:p-0">
            <h2 className="text-3xl font-bold">Outros produtos</h2>
            <ProductList data={productsData} />
          </div>
        </div>
      </main>
    </StoreLayout>
  )
}

export default ProductPage
