import { useRef } from 'react'
import { type NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { ProductList } from '@root/components'
import { env } from '@root/env/client.mjs'
import { StoreLayout } from '@root/layouts'
import { trpc } from '@root/utils'

const SessionHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex w-full items-center justify-center">
      <h2 className="max-w-fit p-2 text-xl font-bold">{title}</h2>
    </div>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  const searchInputRef = useRef<string>('')
  const carouselRef = useRef<null | HTMLUListElement>(null)

  const { data: companyData } = trpc.company.getCompany.useQuery(
    { name: env.NEXT_PUBLIC_COMPANY_NAME },
    {
      staleTime: Infinity,
    }
  )

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
        <div className="relative py-4">
          <div className="absolute flex justify-between -translate-y-1/2 inset-x-5 top-1/2">
            <button onClick={() => {
                if(carouselRef.current === null) return;
                carouselRef.current.scrollLeft -= window.innerWidth;
              }} className="btn btn-circle">❮</button>
            <button onClick={() => {
                if(carouselRef.current === null) return;
                carouselRef.current.scrollLeft += window.innerWidth;
            }} className="btn btn-circle">❯</button>
          </div>
          <ul ref={carouselRef} className="carousel carousel-center p-4 space-x-4 max-w-max max-h-96 bg-neutral rounded-box">
            {companyData?.photos.map((photo,index) => (
              <li key={photo.id} id={`carousel-photo-${index}`} className="carousel-item aspect-video">
                <Image
                  src={photo.url}
                  className="rounded-box"
                  width={1280}
                  height={720}
                  alt={`Imagem do produto`}
                />
              </li>
            ))}
          </ul>
        </div>
        <SessionHeader title="Produtos mais visitados" />
        <ProductList data={productsRankedByViews} />
        <SessionHeader title="Produtos mais comprados" />
        <ProductList data={productsRankedByPurchases} />
      </main>
    </StoreLayout>
  )
}

export default Home
