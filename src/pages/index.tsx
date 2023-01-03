import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

const AuthButton: React.FC = () => {
  const { data: sessionData } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData && (
        <Link
          className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
          href="/admin/usuarios"
        >
          <h3 className="text-2xl font-bold">ADMIN</h3>
        </Link>
      )}
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

const Home: NextPage = () => {
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

export default Home
