const useCases = [
  'Client approvals',
  'Freelance agreements',
  'Internal forms',
  'Vendor documents',
]

export function UseCases() {
  return (
    <section id="use-cases" className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Use Cases</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            FlowSign is built for simple signing moments where speed, privacy, and export quality matter.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase) => (
            <div
              key={useCase}
              className="rounded-xl border border-border/50 bg-card p-6 text-center font-semibold text-foreground"
            >
              {useCase}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
