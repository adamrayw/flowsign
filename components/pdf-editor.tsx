'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditorState } from '@/lib/use-editor-state'
import { EditorOverlay } from './editor-overlay'
import { ElementToolbar } from './element-toolbar'
import { SignatureCanvas } from './signature-canvas'
import { EditorElement, ElementType } from '@/lib/editor-types'
import { Button } from '@/components/ui/button'

let pdfjsLib: any = null
let workerInitialized = false
const PDF_PREVIEW_WIDTH = 720
const SIGNATURE_PREVIEW_PADDING = 4

// Lazy load PDF.js worker setup
const initPdfWorker = async () => {
  if (typeof window !== 'undefined' && !workerInitialized) {
    const pdfModule = await import('pdfjs-dist')
    pdfjsLib = pdfModule
    // Set worker source to public file
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    workerInitialized = true
  }
  return pdfjsLib
}

interface PDFEditorProps {
  pdfUrl: string
  initialElements?: EditorElement[]
  onSaveDraft?: (elements: EditorElement[]) => void
  onFinish?: (elements: EditorElement[], signedPdfDataUrl: string) => void
}

export function PDFEditor({
  pdfUrl,
  initialElements = [],
  onSaveDraft,
  onFinish,
}: PDFEditorProps) {
  const [totalPages, setTotalPages] = useState(1)
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null)
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
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
  } = useEditorState(totalPages, initialElements)

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        if (!pdfUrl) {
          console.log('[v0] No PDF URL provided')
          return
        }

        const pdf = await initPdfWorker()
        
        // Fetch the PDF data from the blob URL
        const response = await fetch(pdfUrl)
        const arrayBuffer = await response.arrayBuffer()
        
        // Load PDF from array buffer
        const doc = await pdf.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
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

  const getElementStartPosition = () => {
    if (!pdfContainerRef.current) return
    const rect = pdfContainerRef.current.getBoundingClientRect()

    return {
      x: rect.width / 2 - 60,
      y: rect.height / 2 - 30,
    }
  }

  const handleAddElement = (type: ElementType) => {
    if (type === 'signature') {
      setShowSignatureCanvas(true)
      return
    }

    const position = getElementStartPosition()
    if (!position) return

    addElement(type, position.x, position.y)
  }

  const handleSaveSignature = (signatureDataUrl: string) => {
    const position = getElementStartPosition()
    if (!position) return

    addElement('signature', position.x, position.y, {
      content: signatureDataUrl,
      width: 180,
      height: 70,
    })
    setShowSignatureCanvas(false)
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

  const currentPageCanvas = pdfPages[state.currentPage - 1]
  const previewSize = currentPageCanvas
    ? {
        width: PDF_PREVIEW_WIDTH,
        height: Math.round((PDF_PREVIEW_WIDTH * currentPageCanvas.height) / currentPageCanvas.width),
      }
    : null

  const getPreviewSizeForPage = (pageIndex: number) => {
    const canvas = pdfPages[pageIndex]
    if (!canvas) return null

    return {
      width: PDF_PREVIEW_WIDTH,
      height: (PDF_PREVIEW_WIDTH * canvas.height) / canvas.width,
    }
  }

  const buildSignedPDF = async () => {
    const [{ PDFDocument, StandardFonts, rgb }] = await Promise.all([
      import('pdf-lib'),
    ])
    const response = await fetch(pdfUrl)
    const originalPdfBytes = await response.arrayBuffer()
    const pdfDoc = await PDFDocument.load(originalPdfBytes)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const pages = pdfDoc.getPages()

    for (const element of state.elements) {
      const pageIndex = element.page - 1
      const page = pages[pageIndex]
      const pagePreviewSize = getPreviewSizeForPage(pageIndex)
      if (!page || !pagePreviewSize) continue

      const pageWidth = page.getWidth()
      const pageHeight = page.getHeight()
      const toPdfRect = (rect: { x: number; y: number; width: number; height: number }) => {
        const width = (rect.width / pagePreviewSize.width) * pageWidth
        const height = (rect.height / pagePreviewSize.height) * pageHeight

        return {
          x: (rect.x / pagePreviewSize.width) * pageWidth,
          y: pageHeight - ((rect.y / pagePreviewSize.height) * pageHeight) - height,
          width,
          height,
        }
      }
      const { x, y, width, height } = toPdfRect(element)

      if (element.type === 'signature' && element.content) {
        const signatureImage = await pdfDoc.embedPng(element.content)
        const contentWidth = Math.max(1, element.width - SIGNATURE_PREVIEW_PADDING * 2)
        const contentHeight = Math.max(1, element.height - SIGNATURE_PREVIEW_PADDING * 2)
        const imageAspectRatio = signatureImage.width / signatureImage.height
        const contentAspectRatio = contentWidth / contentHeight
        const renderedWidth = contentAspectRatio > imageAspectRatio
          ? contentHeight * imageAspectRatio
          : contentWidth
        const renderedHeight = contentAspectRatio > imageAspectRatio
          ? contentHeight
          : contentWidth / imageAspectRatio
        const signatureRect = toPdfRect({
          x: element.x + SIGNATURE_PREVIEW_PADDING + (contentWidth - renderedWidth) / 2,
          y: element.y + SIGNATURE_PREVIEW_PADDING + (contentHeight - renderedHeight) / 2,
          width: renderedWidth,
          height: renderedHeight,
        })

        page.drawImage(signatureImage, signatureRect)
        continue
      }

      if (element.type === 'date') {
        page.drawText(element.content || new Date().toLocaleDateString(), {
          x,
          y: y + height * 0.25,
          size: Math.max(8, height * 0.45),
          font: helvetica,
          color: rgb(0.05, 0.09, 0.16),
        })
        continue
      }

      if (element.type === 'text') {
        page.drawText(element.content || 'Text', {
          x,
          y: y + height * 0.25,
          size: Math.max(8, height * 0.45),
          font: helvetica,
          color: rgb(0.05, 0.09, 0.16),
        })
        continue
      }

      if (element.type === 'initial') {
        page.drawText(element.content || 'Initial', {
          x,
          y: y + height * 0.25,
          size: Math.max(8, height * 0.4),
          font: helveticaBold,
          color: rgb(0.05, 0.09, 0.16),
        })
        continue
      }

      if (element.type === 'stamp') {
        page.drawRectangle({
          x,
          y,
          width,
          height,
          borderWidth: 2,
          borderColor: rgb(0.92, 0.28, 0.6),
          color: rgb(1, 1, 1),
          opacity: 0.15,
        })
        page.drawText(element.content || 'STAMP', {
          x: x + width * 0.18,
          y: y + height * 0.45,
          size: Math.max(8, height * 0.18),
          font: helveticaBold,
          color: rgb(0.92, 0.28, 0.6),
        })
      }
    }

    return pdfDoc.save()
  }

  const createSignedPdfDataUrl = async () => {
    const signedPdfBytes = await buildSignedPDF()
    const blob = new Blob([signedPdfBytes], { type: 'application/pdf' })

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  const handleFinish = async () => {
    if (isFinishing) return

    setIsFinishing(true)
    try {
      const signedPdfDataUrl = await createSignedPdfDataUrl()
      onFinish?.(state.elements, signedPdfDataUrl)
    } catch (error) {
      console.error('[v0] Error completing signed document:', error)
      alert('Failed to complete signed document. Please try again.')
    } finally {
      setIsFinishing(false)
    }
  }

  const handleSaveDraft = () => {
    onSaveDraft?.(state.elements)
  }

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
              disabled={state.currentPage <= 1}
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
              disabled={state.currentPage >= totalPages}
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
                type="button"
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
                  className="w-full h-full pointer-events-none"
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
        <ElementToolbar onAddElement={handleAddElement} />
      </div>

      {/* Main Editing Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900 rounded-lg">
          {currentPageCanvas && previewSize && (
            <div
              ref={pdfContainerRef}
              className="relative shadow-2xl"
              style={{
                width: previewSize.width,
                height: previewSize.height,
              }}
            >
              <canvas
                width={currentPageCanvas.width}
                height={currentPageCanvas.height}
                className="block h-full w-full"
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
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              size="sm"
            >
              Save Draft
            </Button>
            <Button
              onClick={handleFinish}
              disabled={isFinishing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              {isFinishing ? 'Completing...' : 'Complete Signing'}
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

      {showSignatureCanvas && (
        <SignatureCanvas
          onClose={() => setShowSignatureCanvas(false)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  )
}
