import Image from 'next/image'

import { trpc } from '@root/utils'

export const CategoryBanner: React.FC<{ name: string }> = ({ name }) => {
  const { data: src } = trpc.category.bannerUrl.useQuery(
    {
      name,
    },
    {
      staleTime: Infinity,
    }
  )

  if (!src) return <></>

  return (
    <Image
      width={400}
      height={400}
      src={src}
      alt={`Banner da categoria ${name}`}
      className="hidden max-h-44 w-full md:block"
    />
  )
}
