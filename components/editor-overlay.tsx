'use client'

import { useState, useRef, useEffect } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { EditorElement } from '@/lib/editor-types'
import { EditorElementComponent } from './editor-element'

interface EditorOverlayProps {
  elements: EditorElement[]
  selectedElementId: string | null
  currentPage: number
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void
  onShowContextMenu: (id: string, x: number, y: number) => void
}

interface DragState {
  id: string
  pointerId: number
  offsetX: number
  offsetY: number
}

interface ResizeState {
  id: string
  handle: string
  pointerId: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

export function EditorOverlay({
  elements,
  selectedElementId,
  currentPage,
  onSelectElement,
  onUpdateElement,
  onShowContextMenu,
}: EditorOverlayProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const pageElements = elements.filter((el) => el.page === currentPage)

  const getOverlaySize = () => {
    const overlay = overlayRef.current
    return {
      width: overlay?.offsetWidth ?? 0,
      height: overlay?.offsetHeight ?? 0,
    }
  }

  const getOverlayPoint = (clientX: number, clientY: number) => {
    const overlay = overlayRef.current
    if (!overlay) return { x: 0, y: 0 }

    const rect = overlay.getBoundingClientRect()
    const scaleX = rect.width > 0 ? overlay.offsetWidth / rect.width : 1
    const scaleY = rect.height > 0 ? overlay.offsetHeight / rect.height : 1

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    onSelectElement(null)
  }

  const handleElementDragStart = (id: string, e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const element = elements.find((el) => el.id === id)
    if (!element) return

    const point = getOverlayPoint(e.clientX, e.clientY)

    setDragState({
      id,
      pointerId: e.pointerId,
      offsetX: point.x - element.x,
      offsetY: point.y - element.y,
    })
  }

  const handleResizeStart = (
    id: string,
    handle: string,
    e: ReactPointerEvent<HTMLDivElement>,
  ) => {
    e.stopPropagation()
    const element = elements.find((el) => el.id === id)
    if (!element) return

    setResizeState({
      id,
      handle,
      pointerId: e.pointerId,
      startX: element.x,
      startY: element.y,
      startWidth: element.width,
      startHeight: element.height,
    })
  }

  useEffect(() => {
    if (!dragState && !resizeState) return

    const handlePointerMove = (e: PointerEvent) => {
      if (dragState && e.pointerId === dragState.pointerId) {
        const element = elements.find((el) => el.id === dragState.id)
        if (!element) return

        e.preventDefault()

        const point = getOverlayPoint(e.clientX, e.clientY)
        const overlaySize = getOverlaySize()

        onUpdateElement(dragState.id, {
          x: clamp(point.x - dragState.offsetX, 0, overlaySize.width - element.width),
          y: clamp(point.y - dragState.offsetY, 0, overlaySize.height - element.height),
        })
      } else if (resizeState && e.pointerId === resizeState.pointerId) {
        if (!elements.some((el) => el.id === resizeState.id)) return

        e.preventDefault()

        const point = getOverlayPoint(e.clientX, e.clientY)
        const overlaySize = getOverlaySize()
        const minSize = 30

        let newX = resizeState.startX
        let newY = resizeState.startY
        let newWidth = resizeState.startWidth
        let newHeight = resizeState.startHeight

        if (resizeState.handle.includes('e')) {
          newWidth = clamp(
            point.x - resizeState.startX,
            minSize,
            overlaySize.width - resizeState.startX,
          )
        }
        if (resizeState.handle.includes('w')) {
          const right = resizeState.startX + resizeState.startWidth
          newX = clamp(point.x, 0, right - minSize)
          newWidth = right - newX
        }
        if (resizeState.handle.includes('s')) {
          newHeight = clamp(
            point.y - resizeState.startY,
            minSize,
            overlaySize.height - resizeState.startY,
          )
        }
        if (resizeState.handle.includes('n')) {
          const bottom = resizeState.startY + resizeState.startHeight
          newY = clamp(point.y, 0, bottom - minSize)
          newHeight = bottom - newY
        }

        onUpdateElement(resizeState.id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        })
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (dragState?.pointerId === e.pointerId) setDragState(null)
      if (resizeState?.pointerId === e.pointerId) setResizeState(null)
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: false })
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [dragState, resizeState, elements, onUpdateElement])

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
            isDragging={dragState?.id === element.id}
            onSelect={() => onSelectElement(element.id)}
            onDragStart={(event) => handleElementDragStart(element.id, event)}
            onResizeStart={(handle, event) => handleResizeStart(element.id, handle, event)}
            onContextMenu={(e) => {
              e.preventDefault()
              onShowContextMenu(element.id, e.clientX, e.clientY)
            }}
          />
        ))}
    </div>
  )
}
