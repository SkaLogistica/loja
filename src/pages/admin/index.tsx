import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { signIn, signOut, useSession } from 'next-auth/react'

const AuthButton: React.FC = () => {
  const router = useRouter()
  const { data: sessionData } = useSession()

  if (sessionData?.user !== undefined) {
    router.push("/admin/usuarios");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="btn-primary btn gap-2"
        onClick={sessionData ? () => signOut() : () => signIn('google')}
      >
        {sessionData ? (
          'SAIR'
        ) : (
          <>
            <Image
              src={'/google-logo.png'}
              width={30}
              height={30}
              alt={'Logo do Google'}
            />
            <span>ENTRAR COM GOOGLE</span>
          </>
        )}
      </button>
    </div>
  )
}

const AdminHome: NextPage = () => {
  return (
    <>
      <Head>
        <title>Loja SKA Distribuição</title>
        <meta name="description" content="Loja de material de construções" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen bg-black/50">
        <div className="container flex flex-col items-center justify-center gap-2">
          <Image
            src={'/logo.png'}
            width={202}
            height={202}
            alt={'Logo da SKA Distribuição'}
          />
          <AuthButton />
        </div>
      </main>
    </>
  )
}

export default AdminHome
