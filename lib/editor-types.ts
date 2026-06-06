export type ElementType = 'signature' | 'initial' | 'date' | 'text' | 'stamp'

export interface EditorElement {
  id: string
  type: ElementType
  page: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  content?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
}

export interface EditorState {
  elements: EditorElement[]
  selectedElementId: string | null
  totalPages: number
  currentPage: number
}

export const DEFAULT_ELEMENT_SIZES: Record<ElementType, { width: number; height: number }> = {
  signature: { width: 120, height: 60 },
  initial: { width: 60, height: 60 },
  date: { width: 100, height: 30 },
  text: { width: 150, height: 40 },
  stamp: { width: 100, height: 100 },
}

export const ELEMENT_COLORS: Record<ElementType, string> = {
  signature: 'rgb(251, 146, 60)',
  initial: 'rgb(245, 158, 11)',
  date: 'rgb(59, 130, 246)',
  text: 'rgb(139, 92, 246)',
  stamp: 'rgb(236, 72, 153)',
}
