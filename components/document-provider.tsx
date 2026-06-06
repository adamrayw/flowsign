'use client'

import React, { createContext, useContext, useState } from 'react'

interface SignedDocument {
  id: string
  name: string
  uploadedAt: Date
  signedAt?: Date
  signatures: string[]
}

interface DocumentContextType {
  documents: SignedDocument[]
  addDocument: (doc: SignedDocument) => void
  removeDocument: (id: string) => void
  updateDocument: (id: string, doc: Partial<SignedDocument>) => void
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<SignedDocument[]>([])

  const addDocument = (doc: SignedDocument) => {
    setDocuments((prev) => [...prev, doc])
  }

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const updateDocument = (id: string, updates: Partial<SignedDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    )
  }

  return (
    <DocumentContext.Provider value={{ documents, addDocument, removeDocument, updateDocument }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider')
  }
  return context
}
