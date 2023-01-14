import type { inferProcedureOutput } from '@trpc/server'
import Image from 'next/image'
import { useRouter } from 'next/router'

import type { AppRouter } from '@root/server/trpc/router/_app'
import { currencyFormatter } from '@root/utils'

export const ProductCard: React.FC<{
  data: inferProcedureOutput<AppRouter['product']['all']>[number]
}> = ({ data }) => {
  const router = useRouter()

  return (
    <div className="card border bg-base-100 shadow-xl lg:card-side">
      {data.photos.length > 0 ? (
        <figure>
          <Image
            width={256}
            height={256}
            src={data.photos[0]?.url ?? ''}
            alt={`Imagem do ${data.name}`}
            className="w-36 object-contain lg:w-64"
          />
        </figure>
      ) : (
        <></>
      )}
      <div className="card-body">
        <h2 className="card-title">{data.name}</h2>
        <p>{currencyFormatter(Number(data.price))}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() => router.push(`/p/${data.name}`)}
          >
            <a href={`/p/${data.name}`} className="uppercase">
              acessar
            </a>
          </button>
        </div>
      </div>
    </div>
  )
}
