import type { inferProcedureOutput } from '@trpc/server'
import Image from 'next/image'

import type { AppRouter } from '@root/server/trpc/router/_app'
import { currencyFormatter } from '@root/utils'

export const ProductCard: React.FC<{
  data: inferProcedureOutput<AppRouter['product']['all']>[number]
}> = ({ data }) => {
  return (
    <a
      className="card card-bordered bg-base-100 shadow-xl card-normal"
      href={`/p/${data.name}`}
    >
      <figure>
        <Image
          width={256}
          height={256}
          src={data.photos.length > 0 ? data.photos[0]?.url ?? '' : ''}
          alt={`Imagem do ${data.name}`}
          className="w-36 lg:w-64"
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{data.name}</h2>
        <div className="card-actions justify-between items-center">
          <p className="text-xl font-bold">{currencyFormatter(Number(data.price))}</p>
          <a href={`/p/${data.name}`} className="btn-primary btn uppercase">
            acessar
          </a>
        </div>
      </div> 
    </a>
  )
}
