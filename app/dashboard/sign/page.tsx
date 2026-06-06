'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PDFEditor } from '@/components/pdf-editor'
import { EditorElement } from '@/lib/editor-types'

export default function SignPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const selectedFile = files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        const url = URL.createObjectURL(selectedFile)
        setPdfUrl(url)
      } else {
        alert('Please select a PDF file')
      }
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleEditorFinish = (elements: EditorElement[]) => {
    console.log('[v0] Signing complete with elements:', elements)
    
    // Save document to localStorage
    const documentId = Math.random().toString(36).substr(2, 9)
    const document = {
      id: documentId,
      name: file?.name || 'document.pdf',
      uploadedAt: new Date().toISOString(),
      signedAt: new Date().toISOString(),
      signatures: elements.filter((el) => el.type === 'signature').length,
      elements,
    }
    
    const stored = localStorage.getItem('flowsign_documents')
    const documents = stored ? JSON.parse(stored) : []
    documents.push(document)
    localStorage.setItem('flowsign_documents', JSON.stringify(documents))

    alert('Document signed successfully! Redirecting to documents...')
    router.push('/dashboard/documents')
  }

  if (!file || !pdfUrl) {
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
          className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-16 text-center transition-all cursor-pointer hover:bg-primary/5"
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
          <p className="text-muted-foreground text-sm mt-1">{file.name}</p>
        </div>
        <button
          onClick={() => {
            setFile(null)
            setPdfUrl(null)
          }}
          className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          Change File
        </button>
      </div>

      {/* PDF Editor */}
      <div className="flex-1 min-h-0 bg-card border border-border rounded-lg overflow-hidden">
        <PDFEditor pdfUrl={pdfUrl} onFinish={handleEditorFinish} />
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
