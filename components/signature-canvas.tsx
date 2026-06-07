'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Button } from './ui/button'

interface SignatureCanvasProps {
  onClose: () => void
  onSave: (signatureDataUrl: string) => void
}

type SignatureMode = 'draw' | 'type'

const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 260

export function SignatureCanvas({ onClose, onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw')
  const [signatureText, setSignatureText] = useState('')
  const [hasSignature, setHasSignature] = useState(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const configureCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const getCanvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (signatureMode !== 'draw') return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const point = getCanvasPoint(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
    setIsDrawing(true)
    setHasSignature(true)
  }

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signatureMode !== 'draw') return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const point = getCanvasPoint(event)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const drawSignatureText = (text: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!text.trim()) {
      setHasSignature(false)
      return
    }

    ctx.fillStyle = '#0f172a'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'italic 76px "Brush Script MT", "Segoe Script", cursive'
    ctx.fillText(text.trim(), canvas.width / 2, canvas.height / 2, canvas.width - 80)
    setHasSignature(true)
  }

  const handleModeChange = (mode: SignatureMode) => {
    setSignatureMode(mode)
    clearCanvas()
    if (mode === 'type' && signatureText.trim()) {
      requestAnimationFrame(() => drawSignatureText(signatureText))
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    onSave(canvas.toDataURL('image/png'))
  }

  useEffect(() => {
    configureCanvas()
  }, [])

  useEffect(() => {
    if (signatureMode === 'type') {
      drawSignatureText(signatureText)
    }
  }, [signatureText, signatureMode])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border p-6">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Add Your Signature</h2>

          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('draw')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                signatureMode === 'draw'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => handleModeChange('type')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                signatureMode === 'type'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Type
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {signatureMode === 'type' && (
            <input
              type="text"
              value={signatureText}
              onChange={(event) => setSignatureText(event.target.value)}
              placeholder="Type your signature"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
            className={`h-64 w-full rounded-lg border-2 bg-white ${
              signatureMode === 'draw'
                ? 'cursor-crosshair touch-none border-dashed border-border'
                : 'border-border'
            }`}
          />

          <button
            onClick={clearCanvas}
            className="w-full rounded-lg border border-border px-4 py-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Clear
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-card p-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-6 py-2 font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            Cancel
          </button>
          <Button
            onClick={handleSave}
            disabled={!hasSignature}
            className="bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  )
}
