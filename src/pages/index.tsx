import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

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
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/admin"
          >
            <h3 className="text-2xl font-bold">ADMIN</h3>
          </Link>
        </div>
      </main>
    </>
  )
}

export default Home
