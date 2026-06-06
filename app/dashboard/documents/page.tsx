'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface StoredDocument {
  id: string
  name: string
  uploadedAt: string
  signedAt?: string
  signatures: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<StoredDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading documents from storage
    setIsLoading(false)
    const stored = localStorage.getItem('flowsign_documents')
    if (stored) {
      try {
        setDocuments(JSON.parse(stored))
      } catch (error) {
        console.error('[v0] Error parsing stored documents:', error)
      }
    }
  }, [])

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    const remaining = documents.filter((doc) => doc.id !== id)
    localStorage.setItem('flowsign_documents', JSON.stringify(remaining))
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground">My Documents</h2>
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">My Documents</h2>
          <p className="text-muted-foreground">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} stored
          </p>
        </div>
        <Link href="/dashboard/sign">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Sign New Document
          </Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-foreground font-semibold mb-2">No documents yet</p>
          <p className="text-muted-foreground mb-6">
            Start by signing a document to see it here.
          </p>
          <Link href="/dashboard/sign">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Sign Your First Document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-card border border-border/50 rounded-lg p-6 flex items-center justify-between hover:border-primary/50 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📄</span>
                  <h3 className="text-lg font-semibold text-foreground">{doc.name}</h3>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                  {doc.signedAt && (
                    <span>
                      Signed: {new Date(doc.signedAt).toLocaleDateString()}
                    </span>
                  )}
                  <span>{doc.signatures} signature(s)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
                  Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-4 py-2 rounded-lg border border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500/50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
