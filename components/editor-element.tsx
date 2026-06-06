import { EditorElement, ELEMENT_COLORS } from '@/lib/editor-types'

interface EditorElementProps {
  element: EditorElement
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onDrag?: (dx: number, dy: number) => void
  onResizeStart?: (handle: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function EditorElementComponent({
  element,
  isSelected,
  isDragging,
  onSelect,
  onDrag,
  onResizeStart,
  onContextMenu,
}: EditorElementProps) {
  const color = ELEMENT_COLORS[element.type]

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  const handleResizeMouseDown = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onResizeStart?.(handle)
  }

  return (
    <div
      onClick={handleMouseDown}
      onContextMenu={onContextMenu}
      className={`absolute transition-all ${isDragging ? '' : 'cursor-move'} group`}
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
        {/* Resize Handles */}
        {isSelected && (
          <>
            {['nw', 'ne', 'sw', 'se'].map((handle) => (
              <div
                key={handle}
                onMouseDown={(e) => handleResizeMouseDown(handle, e)}
                className="absolute w-3 h-3 bg-white border border-primary rounded-full cursor-pointer"
                style={{
                  [handle.includes('n') ? 'top' : 'bottom']: '-6px',
                  [handle.includes('w') ? 'left' : 'right']: '-6px',
                }}
              />
            ))}
          </>
        )}

        {/* Element Content */}
        <div className="text-center px-2 py-1 pointer-events-none truncate">
          {element.type === 'signature' && (
            <div className="text-xs">Signature</div>
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
      </div>
    </div>
  )
}
