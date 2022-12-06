import { type NextPage } from 'next'
import Head from 'next/head'
import { signIn, signOut, useSession } from 'next-auth/react'

import { trpc } from '../utils/trpc'

const Admin: NextPage = () => {
  const { data: sessionData } = useSession()

  const { data: userRole } = trpc.auth.getUserRole.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  })

  // const hasCorrectRole =
  //   userRole && (userRole === 'Admin' || userRole !== 'Moderator')

  // TODO: get all users

  const translateRoles = {
    Admin: 'Administrador',
    User: 'Usuário',
    Moderator: 'Moderador',
    Editor: 'Editor',
  }

  function translateRole(role: typeof userRole) {
    if (role === undefined) {
      return 'NÃO DEFINIDO'
    }
    return translateRoles[role]
  }

  const getAvatarImg = () => {
    const url = sessionData?.user?.image
    if (url) {
      return (
        <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
          <div className="w-10 rounded-full">
            <img src={url} />
          </div>
        </label>
      )
    }
    return (
      <label
        tabIndex={0}
        className="placeholder btn-ghost btn-circle avatar btn"
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
      <header className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn-ghost btn-circle btn">
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
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <a>Usuários</a>
              </li>
            </ul>
          </div>
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
      </header>
      <main className="flex flex-1 flex-col">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="form-control flex-row items-center gap-10">
            <input
              type="text"
              placeholder="Nome"
              className="input-bordered input input-lg"
            />
            <select
              className="select-bordered select"
              defaultValue="Filtrar Papéis"
            >
              <option disabled>Filtrar Papéis</option>
              {Object.values(translateRoles)
                .sort()
                .map((role) => (
                  <option key={role}>{role}</option>
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
                      <input type="checkbox" className="checkbox" disabled />
                    </label>
                  </th>
                  <th>Nome</th>
                  <th>Papel</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className=" flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img src={sessionData?.user?.image ?? ''} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">
                          {sessionData?.user?.name ?? ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{translateRole(userRole)}</td>
                  <td>{sessionData?.user?.email ?? ''}</td>
                  <td>
                    {/* TODO: implement disable user */}
                    <input type="checkbox" className="toggle" />
                  </td>
                </tr>
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
    </>
  )
}

export default Admin
