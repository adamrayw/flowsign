'use client'

import { ElementType } from '@/lib/editor-types'
import { Button } from '@/components/ui/button'

interface ElementToolbarProps {
  onAddElement: (type: ElementType) => void
  onDownloadPDF?: () => void
  onFinish?: () => void
}

const ELEMENT_BUTTONS: Array<{
  type: ElementType
  label: string
  icon: string
  color: string
}> = [
  { type: 'signature', label: 'Signature', icon: '✍️', color: 'hover:bg-orange-500/20' },
  { type: 'initial', label: 'Initial', icon: 'I', color: 'hover:bg-yellow-500/20' },
  { type: 'date', label: 'Date', icon: '📅', color: 'hover:bg-blue-500/20' },
  { type: 'text', label: 'Text', icon: 'T', color: 'hover:bg-purple-500/20' },
  { type: 'stamp', label: 'Stamp', icon: '🔖', color: 'hover:bg-pink-500/20' },
]

export function ElementToolbar({
  onAddElement,
  onDownloadPDF,
  onFinish,
}: ElementToolbarProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-card border border-border rounded-lg">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Add Elements
      </div>
      <div className="grid grid-cols-2 gap-2">
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

      <div className="border-t border-border my-3" />

      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Actions
      </div>
      <div className="flex flex-col gap-2">
        {onDownloadPDF && (
          <Button
            onClick={onDownloadPDF}
            variant="outline"
            size="sm"
            className="w-full justify-start text-sm"
          >
            📥 Download PDF
          </Button>
        )}
        {onFinish && (
          <Button
            onClick={onFinish}
            className="w-full justify-start text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            ✓ Finish Signing
          </Button>
        )}
      </div>
    </div>
  )
}
