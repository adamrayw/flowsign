'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function DashboardHome() {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    console.log('[v0] Files dropped:', files)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-foreground mb-3">Upload a Document</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your PDF file and start signing in seconds. Your documents are processed locally on your device.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl">📄</div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">
              Drag and drop your PDF here
            </p>
            <p className="text-muted-foreground mb-6">or click to browse files</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Choose File
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Supports PDF files up to 50MB
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {[
          { icon: '🔒', title: 'Private', desc: 'Your documents stay on your device' },
          { icon: '✍️', title: 'Sign Instantly', desc: 'Draw, type, or upload signatures' },
          { icon: '⚡', title: 'Fast Processing', desc: 'Sign multiple documents in seconds' },
        ].map((feature, i) => (
          <div key={i} className="p-6 rounded-xl bg-card border border-border/50">
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
