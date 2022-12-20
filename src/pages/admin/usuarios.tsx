import { useState } from 'react'
import type { Role } from '@prisma/client'
import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

import { Message } from '@root/components'
import { trpc, withAuth } from '@root/utils'

function formatFeedback(feedback: string, id: number) {
  if (!feedback) return <></>
  if (feedback.startsWith('ERRO'))
    return (
      <Message key={`${feedback}${id}`} variant="error">
        <span>{feedback}</span>
      </Message>
    )
  return (
    <Message key={`${feedback}${id}`} variant="success">
      <span>{feedback}</span>
    </Message>
  )
}

const Admin: NextPage = () => {
  const { data: sessionData } = useSession()
  const [isSidePanelOpen, setSidePanelState] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role | undefined>(undefined)
  const [deletedFilter, setDeletedFilter] = useState(false)
  const [feedbacks, setFeedbacks] = useState([] as string[])
  const addFeedback = (feedback: string) =>
    setFeedbacks((old) => [...old, feedback])

  const clearFilters = () => {
    setName('')
    setRole(undefined)
  }

  const enableClearFilters = name !== '' || role !== undefined

  const { data: usersData } = trpc.user.getAllUsers.useQuery(
    {
      name,
      roles: role ? [role] : undefined,
      deleted: deletedFilter,
    },
    {
      enabled: sessionData?.user !== undefined,
    }
  )
  const { mutate: updateUser } = trpc.user.updateUser.useMutation({
    onSuccess: (user) => addFeedback(`Usuário ${user.name} atualizado`),
    onError: (error) => addFeedback(`ERRO: ${error.message}`),
  })
  const toggleStatus = ({ id, active }: { id: string; active: boolean }) =>
    updateUser({ id, active: !active })
  const updateRole = ({ id, role }: { id: string; role: Role }) =>
    updateUser({ id, role })

  const { mutate: deleteUser } = trpc.user.deleteUser.useMutation({
    onSuccess: (user) => addFeedback(`Usuário ${user.name} deletado`),
    onError: (error) => addFeedback(`ERRO: ${error.message}`),
  })

  const translateRoles = {
    Admin: 'Administrador',
    User: 'Usuário',
    Moderator: 'Moderador',
    Editor: 'Editor',
  }

  function translateRole(role: Role | undefined) {
    if (role === undefined) {
      return 'Filtrar Papéis'
    }
    return translateRoles[role]
  }

  const getAvatarImg = () => {
    const url = sessionData?.user?.image
    if (url) {
      return (
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <Image
              src={url}
              alt={`Imagem de perfil do usuário ${sessionData.user?.name}`}
            />
          </div>
        </label>
      )
    }
    return (
      <label
        tabIndex={0}
        className="placeholder btn btn-ghost btn-circle avatar"
      >
        <div className="w-24 rounded-full bg-neutral-focus text-neutral-content">
          <span className="text-3xl">K</span>
        </div>
      </label>
    )
  }

  return (
    <>
      <Head>
        <title>Painel</title>
        <meta
          name="description"
          content="Painel de Administração de Usuários"
        />
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
          <a className="text-xl font-bold normal-case">Usuários</a>
        </div>
        <div className="navbar-end">
          <div className="dropdown-end dropdown">
            <div className="flex flex-col items-center pr-11">
              {getAvatarImg()}
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
          <div className="form-control flex-row items-center gap-10">
            <button
              disabled={!enableClearFilters}
              className="btn"
              onClick={clearFilters}
            >
              Limpar Filtros
            </button>
            <button
              className={`btn ${
                deletedFilter ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => setDeletedFilter((old) => !old)}
            >
              {deletedFilter ? 'Ocultar' : 'Mostrar'} Excluídos
            </button>
            <input
              type="text"
              placeholder="Nome"
              className="input-bordered input input-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="select-bordered select"
              value={translateRole(role)}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option disabled>Filtrar Papéis</option>
              {Object.entries(translateRoles)
                .sort()
                .map(([role, translation]) => (
                  <option key={role} value={role}>
                    {translation}
                  </option>
                ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-1/2">
              <thead>
                <tr>
                  <th>
                    <label>
                      {/* TODO: implement select all */}
                      {/* <input type="checkbox" className="checkbox" disabled /> */}
                    </label>
                  </th>
                  <th>Nome</th>
                  <th>Papel</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.map((user) => (
                  <tr key={user.id}>
                    <th>
                      <button
                        className="btn btn-ghost hover:bg-red-500 hover:text-base-100"
                        onClick={() => deleteUser({ id: user.id })}
                      >
                        Excluir
                      </button>
                    </th>
                    <td>
                      <div className=" flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <Image
                              src={user.image ?? ''}
                              alt={`Foto de perfil do usuário ${user.name}`}
                              width={32}
                              height={32}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="select-bordered select"
                        onChange={(e) =>
                          updateRole({
                            id: user.id,
                            role: e.target.value as Role,
                          })
                        }
                        defaultValue={user.role}
                      >
                        {Object.entries(translateRoles)
                          .sort()
                          .map(([role, translation]) => (
                            <option key={role} value={role}>
                              {translation}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>{user.email ?? ''}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked={user.active}
                        onChange={() => toggleStatus(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th></th>
                  <th>Nome</th>
                  <th>Papel</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
      <aside
        className={`fixed top-0 overflow-auto bg-white transition-all duration-300 ease-in-out ${
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
                href={'empresa'}
              >
                <span>Empresa</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'categorias'}
              >
                <span>Categorias</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'produtos'}
              >
                <span>Produtos</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/10 p-4 font-bold uppercase text-white hover:bg-white/20"
                href={'usuarios'}
              >
                <span>Usuários</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      <div className="toast">
        {feedbacks.map((feedback, idx) => formatFeedback(feedback, idx))}
      </div>
    </>
  )
}

export default withAuth(Admin, ['Admin', 'Moderator'])
