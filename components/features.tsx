export function Features() {
  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Sign documents in seconds. Upload, sign, download. No complex workflows.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your documents never leave your device. Client-side processing keeps everything private.',
    },
    {
      icon: '✍️',
      title: 'Multiple Signatures',
      description: 'Draw, type, or upload your signature. Choose the method that feels natural.',
    },
    {
      icon: '📦',
      title: 'Easy Export',
      description: 'Download signed documents instantly. Ready to share, archive, or send.',
    },
    {
      icon: '🎨',
      title: 'Beautiful UI',
      description: 'Gorgeous, intuitive interface designed for professionals. No learning curve.',
    },
    {
      icon: '⚙️',
      title: 'Free Forever',
      description: 'Sign as many documents as you want. No subscriptions, no hidden fees.',
    },
  ]

  return (
    <section id="features" className="py-20 lg:py-32 bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for speed and simplicity. No unnecessary features, just what works.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
