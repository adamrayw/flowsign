'use client'

import { ElementType } from '@/lib/editor-types'

interface ElementToolbarProps {
  onAddElement: (type: ElementType) => void
}

const ELEMENT_BUTTONS: Array<{
  type: ElementType
  label: string
  icon: string
  color: string
}> = [
  { type: 'signature', label: 'Signature', icon: '✍️', color: 'hover:bg-orange-500/20' },
]

export function ElementToolbar({
  onAddElement,
}: ElementToolbarProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-card border border-border rounded-lg">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Add Elements
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ELEMENT_BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => onAddElement(btn.type)}
            className={`px-3 py-2 rounded-lg border border-border text-foreground text-xs font-medium transition-all ${btn.color} hover:border-primary/50`}
          >
            <span className="mr-1">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

    </div>
  )
}
