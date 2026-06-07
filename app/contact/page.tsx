import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Contact
          </p>
          <h1 className="mb-4 text-4xl font-bold">Contact RayTech</h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            For FlowSign questions, support, or partnership inquiries, contact the RayTech team.
          </p>

          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="font-semibold text-foreground">Email</div>
              <a
                href="mailto:hello@raytech.dev"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                hello@raytech.dev
              </a>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="font-semibold text-foreground">Product</div>
              <p className="text-muted-foreground">FlowSign · A Product by RayTech</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
