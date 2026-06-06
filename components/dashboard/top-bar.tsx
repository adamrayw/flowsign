'use client'

export function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-background border-b border-border flex items-center justify-between px-8 z-40">
      <div>
        <h1 className="text-xl font-bold text-foreground">Welcome to FlowSign</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-lg hover:bg-card/80 transition-colors">
          👤
        </button>
      </div>
    </header>
  )
}
