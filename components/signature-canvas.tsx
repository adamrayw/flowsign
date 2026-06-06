'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from './ui/button'

interface SignatureCanvasProps {
  onClose: () => void
  onSave: (signatureDataUrl: string) => void
}

export function SignatureCanvas({ onClose, onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw')
  const [signatureText, setSignatureText] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size and fill with white background
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  const drawSignatureText = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    clearCanvas()
    ctx.font = 'italic 48px cursive'
    ctx.fillStyle = '#0f172a'
    ctx.textAlign = 'center'
    ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2)
  }

  useEffect(() => {
    if (signatureMode === 'type' && signatureText) {
      drawSignatureText()
    }
  }, [signatureText, signatureMode])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Add Your Signature</h2>

          {/* Mode tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSignatureMode('draw')
                clearCanvas()
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                signatureMode === 'draw'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => setSignatureMode('type')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                signatureMode === 'type'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Type
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {signatureMode === 'draw' ? (
            <>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-64 border-2 border-dashed border-border rounded-lg cursor-crosshair bg-white"
              />
              <button
                onClick={clearCanvas}
                className="w-full px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
              >
                Clear
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Type your signature"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <canvas
                ref={canvasRef}
                className="w-full h-64 border-2 border-border rounded-lg bg-white"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3 justify-end bg-card">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors font-medium"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
          >
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  )
}
