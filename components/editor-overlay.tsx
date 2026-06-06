'use client'

import { useState, useRef, useEffect } from 'react'
import { EditorElement } from '@/lib/editor-types'
import { EditorElementComponent } from './editor-element'

interface EditorOverlayProps {
  elements: EditorElement[]
  selectedElementId: string | null
  currentPage: number
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void
  onShowContextMenu: (id: string, x: number, y: number) => void
  pdfContainerRef: React.RefObject<HTMLDivElement>
}

export function EditorOverlay({
  elements,
  selectedElementId,
  currentPage,
  onSelectElement,
  onUpdateElement,
  onShowContextMenu,
  pdfContainerRef,
}: EditorOverlayProps) {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizingHandle, setResizingHandle] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  const pageElements = elements.filter((el) => el.page === currentPage)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    onSelectElement(null)
  }

  const handleElementDragStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggedElementId(id)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleResizeStart = (id: string, handle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const element = elements.find((el) => el.id === id)
    if (!element) return

    setResizingHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    })
  }

  useEffect(() => {
    if (!draggedElementId && !resizingHandle) return

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedElementId) {
        const element = elements.find((el) => el.id === draggedElementId)
        if (!element) return

        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y

        // Snap to grid (10px)
        const snappedX = Math.round((element.x + dx) / 10) * 10
        const snappedY = Math.round((element.y + dy) / 10) * 10

        onUpdateElement(draggedElementId, {
          x: Math.max(0, snappedX),
          y: Math.max(0, snappedY),
        })

        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (resizingHandle) {
        const element = elements.find((el) => el.id === selectedElementId)
        if (!element) return

        const dx = e.clientX - resizeStart.x
        const dy = e.clientY - resizeStart.y
        const minSize = 30

        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = element.x
        let newY = element.y

        if (resizingHandle.includes('e')) {
          newWidth = Math.max(minSize, resizeStart.width + dx)
        }
        if (resizingHandle.includes('w')) {
          newX = element.x + dx
          newWidth = Math.max(minSize, resizeStart.width - dx)
        }
        if (resizingHandle.includes('s')) {
          newHeight = Math.max(minSize, resizeStart.height + dy)
        }
        if (resizingHandle.includes('n')) {
          newY = element.y + dy
          newHeight = Math.max(minSize, resizeStart.height - dy)
        }

        onUpdateElement(selectedElementId!, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: newWidth,
          height: newHeight,
        })
      }
    }

    const handleMouseUp = () => {
      setDraggedElementId(null)
      setResizingHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedElementId, dragStart, resizingHandle, resizeStart, elements, selectedElementId, onUpdateElement])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedElementId) return

    if (e.key === 'Delete') {
      e.preventDefault()
      // Delete will be handled by parent component
    }

    // Arrow keys for fine positioning
    if (e.key.startsWith('Arrow')) {
      e.preventDefault()
      const element = elements.find((el) => el.id === selectedElementId)
      if (!element) return

      const step = e.shiftKey ? 10 : 1
      const direction = e.key.replace('Arrow', '').toLowerCase()

      let newX = element.x
      let newY = element.y

      if (direction === 'up') newY -= step
      if (direction === 'down') newY += step
      if (direction === 'left') newX -= step
      if (direction === 'right') newX += step

      onUpdateElement(selectedElementId, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      })
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as EventListener)
    return () => {
      document.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [selectedElementId, elements])

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      className="absolute inset-0 overflow-hidden bg-gradient-to-b from-transparent to-transparent"
    >
      {pageElements
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((element) => (
          <EditorElementComponent
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            isDragging={draggedElementId === element.id}
            onSelect={() => onSelectElement(element.id)}
            onDrag={(dx, dy) => {
              onUpdateElement(element.id, {
                x: element.x + dx,
                y: element.y + dy,
              })
            }}
            onResizeStart={(handle) => handleResizeStart(element.id, handle, event as any)}
            onContextMenu={(e) => {
              e.preventDefault()
              onShowContextMenu(element.id, e.clientX, e.clientY)
            }}
          />
        ))}
    </div>
  )
}
