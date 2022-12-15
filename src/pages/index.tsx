import { type NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

const AuthButton: React.FC = () => {
  const { data: sessionData } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData && (
        <Link
          className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
          href="/admin"
        >
          <h3 className="text-2xl font-bold">ADMIN</h3>
        </Link>
      )}
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn('google')}
      >
        {sessionData ? 'Sign out' : 'Sign in'}
      </button>
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Loja SKA Logística</title>
        <meta name="description" content="Loja de material de construções" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-2">
          <AuthButton />
        </div>
      </main>
    </>
  )
}

export default Home
