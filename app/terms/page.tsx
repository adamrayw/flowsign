import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Terms
          </p>
          <h1 className="mb-4 text-4xl font-bold">Terms of Use</h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            These terms describe the basic expectations for using FlowSign, a document signing product by RayTech.
          </p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Use responsibly</h2>
              <p>
                You are responsible for verifying the accuracy, legality, and acceptance of any signed document you create with FlowSign.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">No legal advice</h2>
              <p>
                FlowSign provides signing tooling only. It does not provide legal advice or guarantee that a signature is valid in every jurisdiction or workflow.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Local data</h2>
              <p>
                Documents saved in the app are stored in your browser local storage. Clearing browser data may remove drafts and signed documents.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
