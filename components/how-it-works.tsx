const steps = [
  {
    title: 'Upload your PDF',
    description: 'Choose a PDF from your device. FlowSign prepares it directly in your browser.',
  },
  {
    title: 'Add your signature',
    description: 'Draw or type your signature, then drag and resize it precisely on the document.',
  },
  {
    title: 'Save or download',
    description: 'Save a draft, complete signing, or download the signed PDF when it is ready.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-card px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">How It Works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            A focused signing flow without account setup, complex tools, or unnecessary steps.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border border-border bg-background p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
