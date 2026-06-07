import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { HowItWorks } from '@/components/how-it-works'
import { UseCases } from '@/components/use-cases'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Footer />
    </main>
  )
}
