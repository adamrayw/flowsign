'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PDFViewer } from '@/components/pdf-viewer'
import { SignatureCanvas } from '@/components/signature-canvas'

export default function SignPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const selectedFile = files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
      } else {
        alert('Please select a PDF file')
      }
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleSignatureSave = (dataUrl: string) => {
    setSignature(dataUrl)
    setShowSignatureModal(false)
  }

  const handleDownloadSigned = () => {
    if (!signature || !file) return
    console.log('[v0] Download signed document:', { file: file.name, signature })
    alert('Signed document would be downloaded here')
  }

  if (!file) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sign Document</h2>
          <p className="text-muted-foreground text-sm mt-1">{file.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFile(null)}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            Change File
          </button>
          {signature && (
            <Button
              onClick={handleDownloadSigned}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Download Signed
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <PDFViewer
        file={file}
        onSignClick={() => setShowSignatureModal(true)}
      />

      {/* Signature Display */}
      {signature && (
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-4">Your Signature</p>
          <img
            src={signature}
            alt="Your signature"
            className="h-24 bg-white rounded-lg border border-border"
          />
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureCanvas
          onClose={() => setShowSignatureModal(false)}
          onSave={handleSignatureSave}
        />
      )}
    </div>
  )
}
