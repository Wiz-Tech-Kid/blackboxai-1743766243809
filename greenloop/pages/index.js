import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>GreenLoop | Carbon Tracker</title>
        <meta name="description" content="Track your carbon footprint" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome to GreenLoop</h1>
        <p className="text-lg mb-6">
          Track your carbon footprint and contribute to sustainable development goals.
        </p>
        
        <div className="flex gap-4">
          <Link href="/login" className="btn-primary">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Register
          </Link>
        </div>
      </main>
    </div>
  )
}