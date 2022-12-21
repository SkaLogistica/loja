import Image from 'next/image'

import favicon from '../../public/favicon.ico'

export const getAvatarImg = (user?: {image?: string | null, name?: string | null}) => {
  return (
    <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
      <div className="w-10 rounded-full">
        <Image
          src={user?.image ?? favicon}
          alt={`Imagem de perfil do usuário ${user?.name}`}
        />
      </div>
    </label>
  )
}