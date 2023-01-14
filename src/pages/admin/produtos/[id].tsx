import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import { type NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn, signOut, useSession } from 'next-auth/react'

import {
  currencyFormatter,
  getAvatarImg,
  stringifyQueryParam,
  trpc,
  useAWS,
  useFeedback,
  withAuth,
} from '@root/utils'

/*
 * NOTE: CODE VENDORIZED FROM 'js-brasil' library cause of build issues
 */
export function currencyToNumber(input: string) {
  input = input.replace(/ /g, '')
  if (input.includes('$')) {
    const vals = input.split('$')
    input = vals[1]!
  }

  // Keeping just numbers . and ,
  input = input.replace(/[^0-9.,]+/, '')

  // eua format
  if (input.indexOf('.') === input.length - 1 - 2) {
    input = input.replace(/\,/g, '')
  }
  // br format
  else {
    input = input.replace(/\./g, '').replace(',', '.')
  }

  return parseFloat(input)
}

const EditarProduto: NextPage = () => {
  const { data: sessionData } = useSession()
  const router = useRouter()
  const id = stringifyQueryParam(router.query.id)
  const { addFeedback, Messages } = useFeedback()
  const { upload } = useAWS()
  const uploadFile = upload({
    successCallback: () => {
      addFeedback('Foto carregada com sucesso')
    },
    errorCallback: () => {
      addFeedback('ERRO: Envio da Foto não concluído')
    },
  })
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [visibility, setVisibility] = useState(false)
  const [hiddenPrice, setHiddenPrice] = useState(false)
  const [available, setAvailable] = useState(false)
  const toggleState = (f: Dispatch<SetStateAction<boolean>>) => () =>
    f((old) => !old)

  const [files, setFiles] = useState(
    [] as { id?: string; file?: File; url: string }[]
  )

  const addFile = ({
    id,
    file,
    url,
  }: {
    id?: string
    file?: File
    url: string
  }) => setFiles((old) => [...old, { id, file, url }])
  const deleteFile = ({ url }: { file?: File; url: string }) =>
    setFiles((old) => old.filter(({ url: arrUrl }) => arrUrl !== url))

  const isLocalUrl = (url: string) => url.startsWith('blob')

  const { data: product } = trpc.product.get.useQuery(
    {
      id,
    },
    {
      enabled: sessionData?.user !== undefined,
      refetchInterval: -1,
      refetchOnWindowFocus: false,
      onSuccess: (product) => {
        if (product === null) return

        setName(product.name)
        setPrice(product.price ? currencyFormatter(Number(product.price)) : '')
        setDescription(product.description ?? '')
        setCategoryId(product.categoryId ?? '')
        setSubCategoryId(product.subCategoryId ?? '')
        product.photos.map(({ id, url }) => addFile({ id, url }))
      },
    }
  )

  const { data: categoriesData } = trpc.category.getAllCategories.useQuery(
    {},
    {
      enabled: sessionData?.user !== undefined,
      refetchInterval: -1,
      refetchOnWindowFocus: false,
    }
  )

  const { mutate: updateProduct } = trpc.product.update.useMutation({
    onSuccess: (product) => {
      addFeedback(`Produto ${product.name} atualizado`)
    },
    onError: (error) => addFeedback(`ERRO: ${error.message}`),
  })

  const { mutate: deletePhoto } = trpc.photo.deletePhoto.useMutation({
    onSuccess: (photo) =>
      addFeedback(`Foto ${photo.name} deletada com sucesso`),
    onError: (error) => addFeedback(`ERRO: ${error.message}`),
  })

  const [isSidePanelOpen, setSidePanelState] = useState(false)

  return (
    <>
      <Head>
        <title>Painel</title>
        <meta name="description" content="Painel de Administração de Produto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar bg-base-100">
        <div className="navbar-start">
          <button
            className="btn btn-ghost btn-square"
            onClick={() => setSidePanelState((old) => !old)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
        </div>
        <div className="navbar-center">
          <div className="breadcrumbs text-xl font-bold normal-case">
            <ul>
              <li>
                <Link href={'/admin/produtos'}>Produtos</Link>
              </li>
              <li>{name}</li>
            </ul>
          </div>
        </div>
        <div className="navbar-end">
          <div className="dropdown-end dropdown">
            <div className="flex flex-col items-center pr-11">
              {getAvatarImg(sessionData?.user)}
              <span>{sessionData?.user?.name}</span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <button
                  className="btn btn-primary"
                  onClick={
                    sessionData ? () => signOut() : () => signIn('google')
                  }
                >
                  {sessionData ? 'SAIR' : 'ENTRAR'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="flex flex-1 flex-col">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <form
            className="form-control grid grid-cols-2  items-center gap-10"
            onSubmit={async (e) => {
              e.preventDefault()

              const nonNullFiles = files.filter(
                (file): file is { file: File; url: string } =>
                  file.file !== undefined
              )
              const localFiles = nonNullFiles.filter(({ url }) =>
                isLocalUrl(url)
              )

              await Promise.all(
                localFiles.map(({ file }) =>
                  uploadFile({
                    file,
                    remotePath: `produtos/${id}/${file.name}`,
                  })
                )
              )

              updateProduct({
                id,
                name,
                price: price ? `${currencyToNumber(price)}` : undefined,
                description: description || undefined,
                categoryId: categoryId || undefined,
                subcategoryId: subCategoryId || undefined,
                visibility,
                available,
                hiddenPrice,
                photosFilenames: localFiles.map(
                  ({ file }) => `produtos/${id}/${file.name}`
                ),
              })
            }}
          >
            {/* TODO: mask and parse currency input */}
            <div className="flex gap-10">
              {Array.from(files).map(({ file, url, id: photoId }) => (
                <div key={url} className="indicator">
                  <div className="indicator-item">
                    <button
                      className="btn btn-ghost btn-square bg-red-500 text-base-100"
                      onClick={() => {
                        deleteFile({ file, url })
                        if (photoId === undefined) return
                        deletePhoto({
                          id: photoId,
                        })
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <button className="btn btn-ghost lowercase">
                    <a
                      href={url ?? '#'}
                      className="link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {isLocalUrl(url) ? file?.name : url.split('/').pop()}
                    </a>
                  </button>
                </div>
              ))}
            </div>
            <label
              className="flex h-20 w-64 cursor-pointer items-center justify-center rounded border border-solid border-black object-cover text-lg"
              htmlFor="add-single-img"
            >
              <div className="flex items-center justify-center gap-2">
                Fotos
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="#000000"
                  viewBox="0 0 256 256"
                >
                  <rect width="256" height="256" fill="none"></rect>
                  <path
                    d="M208,208H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H80L96,40h64l16,24h32a16,16,0,0,1,16,16V192A16,16,0,0,1,208,208Z"
                    fill="none"
                    stroke="#000000"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  ></path>
                  <circle
                    cx="128"
                    cy="132"
                    r="36"
                    fill="none"
                    stroke="#000000"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  ></circle>
                </svg>
              </div>
            </label>
            <input
              type="file"
              id="add-single-img"
              accept="image/png, image/jpeg"
              className="hidden"
              alt="Selecione as fotos do produto"
              multiple
              onChange={(e) => {
                if (e.target.files === null) return

                Array.from(e.target.files).forEach((file) => {
                  addFile({ file, url: URL.createObjectURL(file) })
                })
              }}
            />
            <input
              type="text"
              placeholder="Nome"
              className="input-bordered input input-lg"
              value={name ?? product?.name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Preço"
              className="input-bordered input text-lg"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <textarea
              className="textarea-bordered textarea"
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              className="select-bordered select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="" disabled>
                Categorias
              </option>
              {categoriesData?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="select-bordered select"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
            >
              <option value="" disabled>
                SubCategorias
              </option>
              {categoriesData
                ?.filter(({ id }) => id === categoryId)
                .pop()
                ?.subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
            </select>
            <div className="flex flex-row gap-2">
              <div className="label cursor-pointer gap-2">
                <label htmlFor="available" className="label-text">
                  Em Estoque
                </label>
                <input
                  type="checkbox"
                  className="toggle"
                  id="available"
                  defaultChecked={product?.available}
                  onChange={toggleState(setAvailable)}
                />
              </div>
              <div className="label cursor-pointer gap-2">
                <label htmlFor="hiddenPrice" className="label-text">
                  Mostrar Preço
                </label>
                <input
                  type="checkbox"
                  className="toggle"
                  id="hiddenPrice"
                  defaultChecked={!product?.hiddenPrice}
                  onChange={toggleState(setHiddenPrice)}
                />
              </div>
              <div className="label cursor-pointer gap-2">
                <label htmlFor="visibility" className="label-text">
                  Exibir Produto
                </label>
                <input
                  type="checkbox"
                  className="toggle"
                  id="visibility"
                  defaultChecked={product?.visibility}
                  onChange={toggleState(setVisibility)}
                />
              </div>
            </div>
            <input type="submit" className="btn" value="Atualizar Produto" />
          </form>
        </div>
      </main>
      <aside
        className={`fixed top-0 z-20 overflow-auto bg-white transition-all duration-300 ease-in-out ${
          isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-screen w-auto items-start justify-start gap-2 bg-black/50 pt-5 pl-5 pr-20">
          <button
            className="btn btn-ghost text-base-100"
            onClick={() => setSidePanelState(false)}
          >
            Fechar
          </button>
          <ul className="flex h-full flex-col justify-around">
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'/admin/empresa'}
              >
                <span>Empresa</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'/admin/categorias'}
              >
                <span>Categorias</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'/admin/produtos'}
              >
                <span>Produtos</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'/admin/usuarios'}
              >
                <span>Usuários</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      <div className="toast">{Messages}</div>
    </>
  )
}

export default withAuth(EditarProduto, { allowedRoles: ['Admin', 'Editor'] })
