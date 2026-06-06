import Link from 'next/link'
import { Button } from './ui/button'

export function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-card to-background overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="mb-8 inline-block">
          <span className="px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium">
            ✨ The Fastest Way to Sign Documents
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
          Sign Documents <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">in Minutes</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
          No paperwork, no hassle. FlowSign lets you sign agreements, contracts, and forms instantly. Perfect for professionals who value their time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Signing Free
            </Button>
          </Link>
          <button className="px-8 py-6 rounded-lg border border-border text-foreground hover:bg-card/50 transition-colors text-base font-medium">
            Watch Demo
          </button>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground mb-6">Trusted by professionals worldwide</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {['Acme', 'Global Co', 'Tech Inc', 'StartUp'].map((company) => (
              <div key={company} className="text-muted-foreground font-medium opacity-50">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview of dashboard */}
      <div className="relative mt-20 w-full max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-card to-background p-4 border-b border-border">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/40"></div>
              <div className="w-3 h-3 rounded-full bg-primary/30"></div>
              <div className="w-3 h-3 rounded-full bg-primary/20"></div>
            </div>
          </div>
          <div className="h-96 bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-muted-foreground">Dashboard preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
