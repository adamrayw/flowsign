'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'

let pdfjsLib: any = null
let workerInitialized = false

// Lazy load PDF.js worker setup
const initPdfWorker = async () => {
  if (typeof window !== 'undefined' && !workerInitialized) {
    const pdfModule = await import('pdfjs-dist')
    pdfjsLib = pdfModule
    // Import and set the worker directly
    const { default: PdfWorker } = await import('pdfjs-dist/build/pdf.worker.min.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker
    workerInitialized = true
  }
  return pdfjsLib
}

interface PDFViewerProps {
  file: File
  onSignClick: () => void
}

export function PDFViewer({ file, onSignClick }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdf, setPdf] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdfModule = await initPdfWorker()
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfModule.getDocument({ data: arrayBuffer }).promise
        setPdf(pdf)
        setNumPages(pdf.numPages)
        renderPage(pdf, 1)
      } catch (error) {
        console.error('[v0] Error loading PDF:', error)
      }
    }

    loadPDF()
  }, [file])

  const renderPage = async (pdfDoc: any, pageNum: number) => {
    try {
      const page = await pdfDoc.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return

      const scale = 1.5
      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext('2d')
      if (!context) return

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise
    } catch (error) {
      console.error('[v0] Error rendering page:', error)
    }
  }

  useEffect(() => {
    if (pdf && currentPage > 0 && currentPage <= numPages) {
      renderPage(pdf, currentPage)
    }
  }, [currentPage, pdf, numPages])

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-border hover:bg-card/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <span className="px-4 text-foreground font-medium">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className="p-2 rounded-lg border border-border hover:bg-card/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
        <Button
          onClick={onSignClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Sign This Page
        </Button>
      </div>

      {/* Canvas for PDF display */}
      <div className="bg-background border border-border rounded-lg overflow-auto flex items-center justify-center max-h-[calc(100vh-200px)]">
        <canvas
          ref={canvasRef}
          className="bg-background"
        />
      </div>
    </div>
  )
}
