'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditorState } from '@/lib/use-editor-state'
import { EditorOverlay } from './editor-overlay'
import { ElementToolbar } from './element-toolbar'
import { ElementType } from '@/lib/editor-types'
import { Button } from '@/components/ui/button'

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

interface PDFEditorProps {
  pdfUrl: string
  onFinish?: (elements: any[]) => void
}

export function PDFEditor({ pdfUrl, onFinish }: PDFEditorProps) {
  const [totalPages, setTotalPages] = useState(1)
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfContainerRef = useRef<HTMLDivElement>(null)

  const {
    state,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    duplicateElement,
    changeZIndex,
    setCurrentPage,
  } = useEditorState(totalPages)

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdf = await initPdfWorker()
        const doc = await pdf.getDocument(pdfUrl).promise
        setTotalPages(doc.numPages)

        const pages: HTMLCanvasElement[] = []
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          const scale = 1.5
          const viewport = page.getViewport({ scale })
          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({ canvasContext: context, viewport }).promise
          pages.push(canvas)
        }
        setPdfPages(pages)
      } catch (error) {
        console.error('[v0] Error loading PDF:', error)
      }
    }

    loadPDF()
  }, [pdfUrl])

  const handleAddElement = (type: ElementType) => {
    if (!pdfContainerRef.current) return
    const rect = pdfContainerRef.current.getBoundingClientRect()
    addElement(type, rect.width / 2 - 50, rect.height / 2 - 30)
  }

  const handleContextMenu = (elementId: string, x: number, y: number) => {
    setContextMenu({ elementId, x, y })
  }

  const handleDeleteElement = () => {
    if (contextMenu) {
      deleteElement(contextMenu.elementId)
      setContextMenu(null)
    }
  }

  const handleDuplicateElement = () => {
    if (contextMenu) {
      duplicateElement(contextMenu.elementId)
      setContextMenu(null)
    }
  }

  const handleLayerUp = () => {
    if (contextMenu) {
      changeZIndex(contextMenu.elementId, 'up')
    }
  }

  const handleLayerDown = () => {
    if (contextMenu) {
      changeZIndex(contextMenu.elementId, 'down')
    }
  }

  const handleFinish = () => {
    onFinish?.(state.elements)
  }

  const currentPageCanvas = pdfPages[state.currentPage - 1]

  return (
    <div className="flex gap-4 h-full">
      {/* Left Sidebar - Controls */}
      <div className="w-56 overflow-y-auto flex flex-col gap-4 p-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
            Page Navigation
          </label>
          <div className="flex gap-2 mb-2">
            <Button
              onClick={() => setCurrentPage(state.currentPage - 1)}
              disabled={state.currentPage === 1}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              ← Prev
            </Button>
            <div className="flex-1 flex items-center justify-center bg-card border border-border rounded px-2 py-1 text-sm font-medium">
              {state.currentPage} / {totalPages}
            </div>
            <Button
              onClick={() => setCurrentPage(state.currentPage + 1)}
              disabled={state.currentPage === totalPages}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </div>

        {/* Page Thumbnails */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
            Pages
          </label>
          <div className="flex flex-col gap-2">
            {pdfPages.map((canvas, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`relative w-full aspect-[8.5/11] rounded border-2 transition-all overflow-hidden ${
                  state.currentPage === idx + 1
                    ? 'border-primary shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <canvas
                  width={canvas.width}
                  height={canvas.height}
                  className="w-full h-full"
                  ref={(ref) => {
                    if (ref && canvas) {
                      const ctx = ref.getContext('2d')
                      if (ctx) {
                        ctx.drawImage(canvas, 0, 0)
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-1 text-xs font-semibold text-white bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                  Page {idx + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Element Toolbar */}
        <ElementToolbar onAddElement={handleAddElement} onFinish={handleFinish} />
      </div>

      {/* Main Editing Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900 rounded-lg">
          {currentPageCanvas && (
            <div
              ref={pdfContainerRef}
              className="relative shadow-2xl"
              style={{
                width: currentPageCanvas.width,
                height: currentPageCanvas.height,
              }}
            >
              <canvas
                width={currentPageCanvas.width}
                height={currentPageCanvas.height}
                className="w-full block"
                ref={(ref) => {
                  if (ref && currentPageCanvas) {
                    const ctx = ref.getContext('2d')
                    if (ctx) {
                      ctx.drawImage(currentPageCanvas, 0, 0)
                    }
                  }
                }}
              />

              {/* Editor Overlay */}
              <EditorOverlay
                elements={state.elements}
                selectedElementId={state.selectedElementId}
                currentPage={state.currentPage}
                onSelectElement={selectElement}
                onUpdateElement={updateElement}
                onShowContextMenu={handleContextMenu}
                pdfContainerRef={pdfContainerRef}
              />
            </div>
          )}
        </div>

        {/* Bottom Info Bar */}
        <div className="mt-4 flex items-center justify-between p-3 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            {state.elements.length > 0 && (
              <>
                <span className="font-semibold">{state.elements.length}</span> element
                {state.elements.length !== 1 ? 's' : ''} added
              </>
            )}
            {state.elements.length === 0 && 'Click an element type to start adding signatures'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Save Draft
            </Button>
            <Button
              onClick={handleFinish}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              Complete Signing
            </Button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 150),
              top: Math.min(contextMenu.y, window.innerHeight - 180),
            }}
          >
            <button
              onClick={handleDuplicateElement}
              className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 border-b border-border/50 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={handleLayerUp}
              className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 border-b border-border/50 transition-colors"
            >
              Layer: Bring Forward
            </button>
            <button
              onClick={handleLayerDown}
              className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 border-b border-border/50 transition-colors"
            >
              Layer: Send Back
            </button>
            <button
              onClick={handleDeleteElement}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
