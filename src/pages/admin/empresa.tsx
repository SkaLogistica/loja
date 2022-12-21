import { useState } from 'react'
import { type NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

import { env } from '@root/env/client.mjs'
import { getAvatarImg, trpc, useAWS, useFeedback /* withAuth */ } from '@root/utils'

const Empresa: NextPage = () => {
  const { data: sessionData } = useSession()
  const name = env.NEXT_PUBLIC_COMPANY_NAME
  const [cep, setCep] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [stateSubscription, setStateSubscription] = useState('')
  const [workingHours, setWorkingHours] = useState('')

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

  const enableCreateButton =
    name !== '' &&
    cep !== '' &&
    cnpj !== '' &&
    contactEmail !== '' &&
    contactPhone !== '' &&
    stateSubscription !== '' &&
    workingHours !== ''

  const [files, setFiles] = useState(
    [] as { id?: string; file?: File; url: string }[]
  )

  const isLocalUrl = (url: string) => url.startsWith('blob')

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

  const { data: companyData } = trpc.company.getCompany.useQuery(
    {
      name,
    },
    {
      enabled: sessionData?.user !== undefined,
      refetchInterval: -1,
      refetchOnWindowFocus: false,
      onSuccess: (company) => {
        if (company === null) return

        setCep(company.addressCep)
        setCnpj(company.cnpj)
        setContactEmail(company.contactEmail)
        setContactPhone(company.contactPhone)
        setStateSubscription(company.stateSubscription)
        setWorkingHours(company.workingHours)
        company.photos.map(({ id, url }) => addFile({ id, url }))
      },
    }
  )

  const { mutate: createCompany } = trpc.company.createCompany.useMutation({
    onSuccess: (company) => {
      addFeedback(`Empresa ${company.name} atualizada`)
    },
    onError: (error) => addFeedback(`ERRO: ${error.message}`),
  })

  const { mutate: updateCompany } = trpc.company.updateCompany.useMutation({
    onSuccess: (company) => {
      addFeedback(`Empresa ${company.name} atualizado`)
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
        <meta name="description" content="Painel de Administração de Empresa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar bg-base-100">
        <div className="navbar-start">
          <button
            className="btn-ghost btn-square btn"
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
          <a className="text-xl font-bold normal-case">Empresa</a>
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
                  className="btn-primary btn"
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
            className="form-control grid grid-cols-2 items-center gap-10"
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
                    remotePath: `empresa/${file.name}`,
                  })
                )
              )

              const params = {
                cep,
                cnpj,
                contactEmail,
                contactPhone,
                name,
                stateSubscription,
                workingHours,
                photosFilenames: localFiles.map(
                  ({ file }) => `empresa/${file.name}`
                ),
              }
              if (companyData) {
                updateCompany(params)
              } else {
                createCompany(params)
              }
            }}
          >
            <div className="flex gap-10">
              {Array.from(files).map(({ file, url, id: photoId }) => (
                <div key={url} className="indicator">
                  <div className="indicator-item">
                    <button
                      className="btn-ghost btn-square btn bg-red-500 text-base-100"
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
                  <button className="btn-ghost btn lowercase">
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
              value={name}
              disabled
            />
            <input
              type="text"
              placeholder="CEP"
              className="input-bordered input input-lg"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
            />
            <input
              type="text"
              placeholder="CNPJ"
              className="input-bordered input input-lg"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
            <input
              type="text"
              placeholder="E-mail"
              className="input-bordered input input-lg"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Telefone"
              className="input-bordered input input-lg"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Inscrição Estadual"
              className="input-bordered input input-lg"
              value={stateSubscription}
              onChange={(e) => setStateSubscription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Horário de Funcionamento"
              className="input-bordered input input-lg"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
            />
            <input
              type="submit"
              disabled={!enableCreateButton}
              className="btn"
              value="Atualizar"
            />
          </form>
        </div>
      </main>
      <aside
        className={`fixed z-20 top-0 overflow-auto bg-white transition-all duration-300 ease-in-out ${
          isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-screen w-auto items-start justify-start gap-2 bg-black/50 pt-5 pl-5 pr-20">
          <button
            className="btn-ghost btn text-base-100"
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

export default Empresa // withAuth(Empresa, ['Admin'])
