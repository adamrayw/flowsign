'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EditorElement } from '@/lib/editor-types'

interface StoredDocument {
  id: string
  name: string
  uploadedAt: string
  signedAt?: string
  signatures: number
  elements?: EditorElement[]
  originalPdfDataUrl?: string
  signedPdfDataUrl?: string
}

export default function DashboardHome() {
  const router = useRouter()
  const [documents, setDocuments] = useState<StoredDocument[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('flowsign_documents')
    if (!stored) return

    try {
      setDocuments(JSON.parse(stored))
    } catch (error) {
      console.error('[v0] Error parsing stored documents:', error)
    }
  }, [])

  const totalSignatures = documents.reduce((total, doc) => total + doc.signatures, 0)
  const latestDocument = documents
    .filter((doc) => doc.signedAt)
    .sort((a, b) => new Date(b.signedAt!).getTime() - new Date(a.signedAt!).getTime())[0]
  const recentDocuments = documents
    .slice()
    .sort((a, b) => new Date(b.signedAt || b.uploadedAt).getTime() - new Date(a.signedAt || a.uploadedAt).getTime())
    .slice(0, 5)

  const handleOpenDocument = (document: StoredDocument) => {
    if (!document.originalPdfDataUrl && !document.signedPdfDataUrl) {
      alert('This document cannot be opened for editing. Please sign it again from the original PDF.')
      return
    }

    localStorage.setItem('flowsign_edit_document', JSON.stringify(document))
    router.push('/dashboard/sign')
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Dashboard
            </p>
            <h2 className="mb-3 text-3xl font-bold text-foreground">Document signing overview</h2>
            <p className="max-w-2xl text-muted-foreground">
              Track signed documents, review recent activity, and start a new signature flow from one place.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard/sign">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
                ✍️ Sign New Document
              </Button>
            </Link>
            <Link href="/dashboard/documents">
              <Button variant="outline" className="w-full sm:w-auto">
                View Documents
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: 'Signed Documents', value: documents.length, icon: '📄' },
          { label: 'Signatures Added', value: totalSignatures, icon: '✍️' },
          {
            label: 'Latest Activity',
            value: latestDocument ? new Date(latestDocument.signedAt!).toLocaleDateString() : '—',
            icon: '🕒',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
              {item.icon}
            </div>
            <div className="text-3xl font-bold text-foreground">{item.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Recent Documents</h3>
            <p className="text-sm text-muted-foreground">Last signed documents saved locally.</p>
          </div>
          <Link href="/dashboard/documents" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <div className="mb-3 text-4xl">📚</div>
            <p className="font-semibold text-foreground">No signed documents yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use Sign New Document to create your first signed PDF.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Signed {doc.signedAt ? new Date(doc.signedAt).toLocaleDateString() : '—'} · {doc.signatures} signature(s)
                  </p>
                </div>
                <Button
                  onClick={() => handleOpenDocument(doc)}
                  variant="outline"
                  size="sm"
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
