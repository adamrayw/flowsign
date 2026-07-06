'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PDFEditor } from '@/components/pdf-editor'
import { EditorElement } from '@/lib/editor-types'
import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/storage'

interface EditableDocument {
  id: string
  name: string
  uploadedAt: string
  signedAt?: string
  signatures: number
  elements?: EditorElement[]
  originalPdfDataUrl?: string
  signedPdfDataUrl?: string
  status?: 'draft' | 'signed'
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export default function SignPage() {
  const router = useRouter()
  const [documentName, setDocumentName] = useState('document.pdf')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [sourcePdfDataUrl, setSourcePdfDataUrl] = useState<string | null>(null)
  const [editingDocument, setEditingDocument] = useState<EditableDocument | null>(null)
  const [initialElements, setInitialElements] = useState<EditorElement[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadDoc = async () => {
      try {
        const stored = await getStorageItem<EditableDocument>('flowsign_edit_document')
        if (!stored) return
        
        const documentToEdit = stored
        const editablePdfUrl = documentToEdit.originalPdfDataUrl || documentToEdit.signedPdfDataUrl
        if (!editablePdfUrl) return

        setEditingDocument(documentToEdit)
        setDocumentName(documentToEdit.name)
        setPdfUrl(editablePdfUrl)
        setSourcePdfDataUrl(editablePdfUrl)
        setInitialElements(documentToEdit.originalPdfDataUrl ? documentToEdit.elements || [] : [])
        await removeStorageItem('flowsign_edit_document')
      } catch (error) {
        console.error('[v0] Error loading document for edit:', error)
      }
    }
    loadDoc()
  }, [])

  const loadPdfFile = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    setEditingDocument(null)
    setInitialElements([])
    setDocumentName(selectedFile.name)
    const fileDataUrl = await readFileAsDataUrl(selectedFile)
    setPdfUrl(fileDataUrl)
    setSourcePdfDataUrl(fileDataUrl)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await loadPdfFile(selectedFile)
      e.target.value = ''
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    }

    if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const selectedFile = e.dataTransfer.files?.[0]
    if (selectedFile) {
      await loadPdfFile(selectedFile)
    }
  }

  const handleEditorFinish = async (elements: EditorElement[], signedPdfDataUrl: string) => {
    console.log('[v0] Signing complete with elements:', elements)
    
    // Save document to IndexedDB
    const documentId = editingDocument?.id || Math.random().toString(36).substr(2, 9)
    const document: EditableDocument = {
      id: documentId,
      name: documentName,
      uploadedAt: editingDocument?.uploadedAt || new Date().toISOString(),
      signedAt: new Date().toISOString(),
      signatures: elements.filter((el) => el.type === 'signature').length,
      elements,
      originalPdfDataUrl: sourcePdfDataUrl || pdfUrl || undefined,
      signedPdfDataUrl,
      status: 'signed',
    }
    
    const stored = await getStorageItem<EditableDocument[]>('flowsign_documents')
    const documents = stored || []
    const documentIndex = documents.findIndex((doc) => doc.id === documentId)

    if (documentIndex >= 0) {
      documents[documentIndex] = document
    } else {
      documents.push(document)
    }

    await setStorageItem('flowsign_documents', documents)
    setShowSuccessModal(true)
  }

  const handleSaveDraft = async (elements: EditorElement[]) => {
    const documentId = editingDocument?.id || Math.random().toString(36).substr(2, 9)
    const document: EditableDocument = {
      id: documentId,
      name: documentName,
      uploadedAt: editingDocument?.uploadedAt || new Date().toISOString(),
      signedAt: editingDocument?.signedAt,
      signatures: elements.filter((el) => el.type === 'signature').length,
      elements,
      originalPdfDataUrl: sourcePdfDataUrl || pdfUrl || undefined,
      signedPdfDataUrl: editingDocument?.signedPdfDataUrl,
      status: 'draft',
    }

    const stored = await getStorageItem<EditableDocument[]>('flowsign_documents')
    const documents = stored || []
    const documentIndex = documents.findIndex((doc) => doc.id === documentId)

    if (documentIndex >= 0) {
      documents[documentIndex] = document
    } else {
      documents.push(document)
    }

    await setStorageItem('flowsign_documents', documents)
    setEditingDocument(document)
    alert('Draft saved successfully.')
  }

  if (!pdfUrl) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Upload a Document to Sign</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select a PDF file to start the signing process. Your document will be processed securely on your device.
          </p>
        </div>

        <div
          onClick={handleFileUpload}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">📄</div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">
                Click to upload your PDF
              </p>
              <p className="text-muted-foreground mb-6">or drag and drop</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Choose File
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              PDF files up to 50MB
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sign Document</h2>
          <p className="text-muted-foreground text-sm mt-1">{documentName}</p>
        </div>
        <button
          onClick={() => {
            setPdfUrl(null)
            setSourcePdfDataUrl(null)
            setEditingDocument(null)
            setInitialElements([])
            setDocumentName('document.pdf')
          }}
          className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          Change File
        </button>
      </div>

      {/* PDF Editor */}
      <div className="flex-1 min-h-0 bg-card border border-border rounded-lg overflow-hidden">
        <PDFEditor
          pdfUrl={pdfUrl}
          initialElements={initialElements}
          onSaveDraft={handleSaveDraft}
          onFinish={handleEditorFinish}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-3xl">
              ✓
            </div>
            <h3 className="mb-2 text-2xl font-bold text-foreground">Document Signed</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {documentName} has been signed successfully and saved to your documents.
            </p>
            <Button
              onClick={() => router.push('/dashboard/documents')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to Documents
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
