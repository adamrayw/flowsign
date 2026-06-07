import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Privacy
          </p>
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            FlowSign is designed as a local-first signing tool. Documents are processed in your browser and stored locally on your device.
          </p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Local document processing</h2>
              <p>
                Uploaded PDFs and signatures are handled client-side. FlowSign does not intentionally upload your documents to a server for signing.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Local storage</h2>
              <p>
                Signed documents, drafts, and signature placement data may be saved in your browser local storage so you can reopen or download them.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Analytics</h2>
              <p>
                Basic product analytics may be used to understand page usage. Do not upload confidential documents unless your local environment is trusted.
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
