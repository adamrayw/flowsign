import type { MouseEvent, PointerEvent } from 'react'
import { EditorElement, ELEMENT_COLORS } from '@/lib/editor-types'

interface EditorElementProps {
  element: EditorElement
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onDragStart?: (event: PointerEvent<HTMLDivElement>) => void
  onResizeStart?: (handle: string, event: PointerEvent<HTMLDivElement>) => void
  onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void
}

const RESIZE_HANDLES = [
  { handle: 'nw', className: 'left-1 top-1 cursor-nwse-resize' },
  { handle: 'n', className: 'left-1/2 top-1 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'ne', className: 'right-1 top-1 cursor-nesw-resize' },
  { handle: 'e', className: 'right-1 top-1/2 -translate-y-1/2 cursor-ew-resize' },
  { handle: 'se', className: 'right-1 bottom-1 cursor-nwse-resize' },
  { handle: 's', className: 'left-1/2 bottom-1 -translate-x-1/2 cursor-ns-resize' },
  { handle: 'sw', className: 'left-1 bottom-1 cursor-nesw-resize' },
  { handle: 'w', className: 'left-1 top-1/2 -translate-y-1/2 cursor-ew-resize' },
]

export function EditorElementComponent({
  element,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onResizeStart,
  onContextMenu,
}: EditorElementProps) {
  const color = ELEMENT_COLORS[element.type]

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onSelect()
    onDragStart?.(e)
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onContextMenu?.(e)
  }

  const handleResizePointerDown = (handle: string, e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onResizeStart?.(handle, e)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className={`absolute ${isDragging ? '' : 'cursor-move'} group select-none touch-none`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex,
        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      <div
        className={`w-full h-full relative rounded border-2 flex items-center justify-center font-semibold text-white text-sm transition-colors ${
          isSelected
            ? 'border-white bg-opacity-20 shadow-lg'
            : 'border-opacity-50 hover:border-opacity-100'
        }`}
        style={{
          backgroundColor: `${color}20`,
          borderColor: color,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Element Content */}
        <div
          className={`h-full w-full text-center pointer-events-none truncate ${
            element.type === 'signature' ? 'p-1' : 'px-2 py-1'
          }`}
        >
          {element.type === 'signature' && (
            element.content ? (
              <img
                src={element.content}
                alt="Signature"
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="text-xs">Signature</div>
            )
          )}
          {element.type === 'initial' && (
            <div className="text-xs">Initial</div>
          )}
          {element.type === 'date' && (
            <div className="text-xs">{element.content || 'Date'}</div>
          )}
          {element.type === 'text' && (
            <div className="text-xs">{element.content || 'Text'}</div>
          )}
          {element.type === 'stamp' && (
            <div className="text-xs">Stamp</div>
          )}
        </div>

        {/* Resize Handles */}
        {isSelected && (
          <>
            <div className="pointer-events-none absolute inset-0 z-20 rounded border border-primary/80 bg-primary/5" />
            {RESIZE_HANDLES.map(({ handle, className }) => (
              <div
                key={handle}
                onPointerDown={(e) => handleResizePointerDown(handle, e)}
                className={`absolute z-30 h-5 w-5 rounded-full border-2 border-primary bg-white shadow-lg ring-2 ring-slate-900/30 ${className}`}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
