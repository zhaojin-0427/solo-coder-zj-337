export type CeremonyScene = 'welcome' | 'tea' | 'capping' | 'sacrifice'

export type ViewMode = 'top' | 'flow'

export type ElementCategory = 'seat' | 'table' | 'mat' | 'vessel' | 'decor'

export type ElementType =
  | 'seat-main'
  | 'seat-guest'
  | 'seat-secondary'
  | 'seat-host'
  | 'table'
  | 'table-low'
  | 'mat'
  | 'mat-guest'
  | 'vessel-tea'
  | 'vessel-wine'
  | 'vessel-water'
  | 'vessel-fruit'
  | 'incense'
  | 'candle'
  | 'scroll'
  | 'flower'

export interface CanvasElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  label: string
  role?: string
  zIndex: number
}

export interface CeremonyStep {
  id: string
  order: number
  title: string
  description: string
  direction?: string
  involvedElements: string[]
  deliveryRoute?: {
    from: string
    to: string
    item: string
  }
  duration?: string
  gesture?: string
}

export interface CeremonyTemplate {
  scene: CeremonyScene
  name: string
  description: string
  icon: string
  steps: CeremonyStep[]
  defaultElements: CanvasElement[]
}

export interface CeremonyScheme {
  id: string
  name: string
  scene: CeremonyScene
  createdAt: number
  updatedAt: number
  elements: CanvasElement[]
  currentStepIndex: number
}

export interface MaterialItem {
  type: ElementType
  category: ElementCategory
  name: string
  defaultWidth: number
  defaultHeight: number
  icon: string
}
