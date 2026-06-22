export type CeremonyScene = 'welcome' | 'tea' | 'capping' | 'sacrifice'

export type ViewMode = 'top' | 'flow' | 'compare'

export type CompareViewMode = 'top' | 'flow'

export type ElementCategory = 'seat' | 'table' | 'mat' | 'vessel' | 'decor'

export type DiffType = 'added' | 'removed' | 'moved' | 'unchanged'

export type PrintFontSize = 'standard' | 'large'

export type BeatType = 'instant' | 'countdown' | 'signal' | 'previous-finish' | 'manual'

export interface BeatCondition {
  type: BeatType
  value?: string
  waitRoleIds?: string[]
  waitStepIds?: string[]
  description?: string
}

export interface RehearsalRole {
  id: string
  name: string
  description?: string
  color: string
  order: number
}

export interface StepCommand {
  id: string
  stepId: string
  commandText: string
  executorRoleId: string
  beatType: BeatType
  beatValue?: string
  beatCountdown?: number
  waitConditions: BeatCondition[]
  notes?: string
}

export interface SchemeSnapshot {
  id: string
  schemeId: string
  scene: CeremonyScene
  timestamp: number
  name: string
  elements: CanvasElement[]
  currentStepIndex: number
  roles: RehearsalRole[]
  stepCommands: StepCommand[]
}

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
  roleId?: string
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
  defaultRoles: RehearsalRole[]
  defaultStepCommands?: StepCommand[]
}

export interface CeremonyScheme {
  id: string
  name: string
  scene: CeremonyScene
  createdAt: number
  updatedAt: number
  elements: CanvasElement[]
  currentStepIndex: number
  roles: RehearsalRole[]
  stepCommands: StepCommand[]
}

export interface MaterialItem {
  type: ElementType
  category: ElementCategory
  name: string
  defaultWidth: number
  defaultHeight: number
  icon: string
}

export interface ElementDiff {
  elementId: string
  element?: CanvasElement
  baseElement?: CanvasElement
  diffType: DiffType
  displacement?: { dx: number; dy: number }
}

export interface StepDiff {
  stepId: string
  step?: CeremonyStep
  baseStep?: CeremonyStep
  diffType: DiffType
  changedFields?: string[]
}

export interface CompareResult {
  schemeA: CeremonyScheme
  schemeB: CeremonyScheme
  elementDiffsA: ElementDiff[]
  elementDiffsB: ElementDiff[]
  stepDiffsA: StepDiff[]
  stepDiffsB: StepDiff[]
}

export interface PrintSettings {
  fontSize: PrintFontSize
  showDirection: boolean
  showDeliveryRoute: boolean
  showRoleCommands: boolean
  showRoleAssignment: boolean
}

export const DEFAULT_ROLE_COLORS = [
  '#8B4513',
  '#5F9EA0',
  '#D4AF37',
  '#CD5C5C',
  '#6B8E23',
  '#4682B4',
  '#9932CC',
  '#FF8C00',
  '#20B2AA',
  '#DB7093',
]
