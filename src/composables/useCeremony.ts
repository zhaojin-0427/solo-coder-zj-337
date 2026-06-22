import { ref, computed } from 'vue'
import type {
  CeremonyScene,
  CanvasElement,
  CeremonyStep,
  ViewMode,
  CeremonyScheme,
  SchemeSnapshot,
  ElementDiff,
  StepDiff,
  CompareResult,
  CompareViewMode,
  PrintSettings,
  DiffType,
  RehearsalRole,
  StepCommand,
  BeatCondition,
} from '@/types'
import { ceremonyTemplates, getTemplateByScene, createDefaultElements, createDefaultRoles, createDefaultStepCommands } from '@/data/templates'
import { generateId } from '@/utils/id'
import {
  loadSchemes,
  saveSchemes,
  addScheme,
  deleteScheme,
  addSnapshot,
  getSnapshotsBySchemeId,
  getSnapshotById,
  deleteSnapshot as removeSnapshot,
} from '@/utils/storage'
import { DEFAULT_ROLE_COLORS } from '@/types'

const currentScene = ref<CeremonyScene>('welcome')
const viewMode = ref<ViewMode>('top')
const elements = ref<CanvasElement[]>([])
const selectedElementId = ref<string | null>(null)
const currentStepIndex = ref(0)
const schemeName = ref('未命名方案')
const isPlaying = ref(false)
let playInterval: number | null = null
const PLAY_DURATION = 3000

const roles = ref<RehearsalRole[]>([])
const stepCommands = ref<StepCommand[]>([])
const highlightedRoleId = ref<string | null>(null)

const currentSchemeId = ref<string | null>(null)

const compareViewMode = ref<CompareViewMode>('top')
const compareSchemeA = ref<CeremonyScheme | null>(null)
const compareSchemeB = ref<CeremonyScheme | null>(null)
const compareResult = ref<CompareResult | null>(null)

const printSettings = ref<PrintSettings>({
  fontSize: 'standard',
  showDirection: true,
  showDeliveryRoute: true,
  showRoleCommands: true,
  showRoleAssignment: true,
})

export function useCeremony() {
  const currentTemplate = computed(() => getTemplateByScene(currentScene.value))

  const steps = computed<CeremonyStep[]>(() => {
    return currentTemplate.value?.steps || []
  })

  const currentStep = computed(() => {
    return steps.value[currentStepIndex.value] || null
  })

  const selectedElement = computed(() => {
    if (!selectedElementId.value) return null
    return elements.value.find(el => el.id === selectedElementId.value) || null
  })

  const involvedElementIds = computed(() => {
    return currentStep.value?.involvedElements || []
  })

  const isCompareMode = computed(() => viewMode.value === 'compare')

  const currentStepCommands = computed(() => {
    if (!currentStep.value) return []
    return stepCommands.value.filter(cmd => cmd.stepId === currentStep.value!.id)
  })

  const sortedRoles = computed(() => {
    return [...roles.value].sort((a, b) => a.order - b.order)
  })

  function getRoleById(roleId: string): RehearsalRole | undefined {
    return roles.value.find(r => r.id === roleId)
  }

  function getRoleName(roleId: string): string {
    return getRoleById(roleId)?.name || '未指定'
  }

  function getRoleColor(roleId: string): string {
    return getRoleById(roleId)?.color || '#888'
  }

  function getCommandsByStepId(stepId: string): StepCommand[] {
    return stepCommands.value.filter(cmd => cmd.stepId === stepId)
  }

  function getElementsByRoleId(roleId: string): CanvasElement[] {
    return elements.value.filter(el => el.roleId === roleId)
  }

  function startPlay() {
    if (playInterval) {
      clearInterval(playInterval)
    }
    isPlaying.value = true
    playInterval = window.setInterval(() => {
      if (currentStepIndex.value < steps.value.length - 1) {
        currentStepIndex.value++
      } else {
        stopPlay()
      }
    }, PLAY_DURATION)
  }

  function stopPlay() {
    if (playInterval) {
      clearInterval(playInterval)
      playInterval = null
    }
    isPlaying.value = false
  }

  function togglePlay() {
    if (isPlaying.value) {
      stopPlay()
    } else {
      if (currentStepIndex.value >= steps.value.length - 1) {
        currentStepIndex.value = 0
      }
      startPlay()
    }
  }

  function getElementLabel(id: string): string {
    const el = elements.value.find(e => e.id === id)
    if (el) return el.label
    return id
  }

  function setScene(scene: CeremonyScene) {
    stopPlay()
    currentScene.value = scene
    elements.value = createDefaultElements(scene)
    roles.value = createDefaultRoles(scene)
    stepCommands.value = createDefaultStepCommands(scene)
    currentStepIndex.value = 0
    selectedElementId.value = null
    highlightedRoleId.value = null
    schemeName.value = `${currentTemplate.value?.name || '方案'} - ${new Date().toLocaleDateString()}`
    currentSchemeId.value = null
  }

  function setViewMode(mode: ViewMode) {
    if (mode === 'compare') {
      stopPlay()
    }
    viewMode.value = mode
  }

  function exitCompareMode() {
    compareSchemeA.value = null
    compareSchemeB.value = null
    compareResult.value = null
    setViewMode('top')
  }

  function setCompareViewMode(mode: CompareViewMode) {
    compareViewMode.value = mode
  }

  function addElement(type: string, x: number, y: number) {
    const template = currentTemplate.value
    const defaultEl = template?.defaultElements.find(el => el.type === type)
    const newElement: CanvasElement = {
      id: generateId(type),
      type: type as CanvasElement['type'],
      x,
      y,
      width: defaultEl?.width || 60,
      height: defaultEl?.height || 60,
      rotation: 0,
      label: defaultEl?.label || type,
      role: defaultEl?.role,
      roleId: defaultEl?.roleId,
      zIndex: elements.value.length + 1,
    }
    elements.value.push(newElement)
    selectedElementId.value = newElement.id
    return newElement
  }

  function updateElement(id: string, updates: Partial<CanvasElement>) {
    const index = elements.value.findIndex(el => el.id === id)
    if (index !== -1) {
      elements.value[index] = { ...elements.value[index], ...updates }
    }
  }

  function deleteElement(id: string) {
    const index = elements.value.findIndex(el => el.id === id)
    if (index !== -1) {
      elements.value.splice(index, 1)
      if (selectedElementId.value === id) {
        selectedElementId.value = null
      }
    }
  }

  function selectElement(id: string | null) {
    selectedElementId.value = id
  }

  function setStepIndex(index: number) {
    if (index >= 0 && index < steps.value.length) {
      currentStepIndex.value = index
    }
  }

  function nextStep() {
    if (currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value++
    }
  }

  function prevStep() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  function bringToFront(id: string) {
    const maxZ = Math.max(...elements.value.map(el => el.zIndex))
    updateElement(id, { zIndex: maxZ + 1 })
  }

  function isInvolved(id: string): boolean {
    return involvedElementIds.value.includes(id)
  }

  function setHighlightedRole(roleId: string | null) {
    highlightedRoleId.value = roleId
  }

  function isElementHighlighted(elementId: string): boolean {
    if (!highlightedRoleId.value) return true
    const el = elements.value.find(e => e.id === elementId)
    return el?.roleId === highlightedRoleId.value
  }

  function addRole(name: string, description?: string): RehearsalRole {
    const colorIndex = roles.value.length % DEFAULT_ROLE_COLORS.length
    const newRole: RehearsalRole = {
      id: generateId('role'),
      name,
      description,
      color: DEFAULT_ROLE_COLORS[colorIndex],
      order: roles.value.length + 1,
    }
    roles.value.push(newRole)
    return newRole
  }

  function updateRole(roleId: string, updates: Partial<RehearsalRole>) {
    const index = roles.value.findIndex(r => r.id === roleId)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...updates }
    }
  }

  function deleteRole(roleId: string) {
    const index = roles.value.findIndex(r => r.id === roleId)
    if (index !== -1) {
      roles.value.splice(index, 1)
      roles.value.forEach((r, i) => { r.order = i + 1 })
      elements.value.forEach(el => {
        if (el.roleId === roleId) {
          el.roleId = undefined
          el.role = undefined
        }
      })
      stepCommands.value.forEach(cmd => {
        if (cmd.executorRoleId === roleId) {
          cmd.executorRoleId = ''
        }
        cmd.waitConditions.forEach(wc => {
          if (wc.waitRoleIds) {
            wc.waitRoleIds = wc.waitRoleIds.filter(id => id !== roleId)
          }
        })
      })
      if (highlightedRoleId.value === roleId) {
        highlightedRoleId.value = null
      }
    }
  }

  function reorderRole(roleId: string, newOrder: number) {
    const role = roles.value.find(r => r.id === roleId)
    if (!role) return
    const oldOrder = role.order
    if (oldOrder === newOrder) return
    roles.value.forEach(r => {
      if (oldOrder < newOrder) {
        if (r.order > oldOrder && r.order <= newOrder) {
          r.order--
        }
      } else {
        if (r.order >= newOrder && r.order < oldOrder) {
          r.order++
        }
      }
    })
    role.order = newOrder
  }

  function bindElementToRole(elementId: string, roleId: string | null) {
    const el = elements.value.find(e => e.id === elementId)
    if (el) {
      if (roleId) {
        const role = getRoleById(roleId)
        el.roleId = roleId
        el.role = role?.name
      } else {
        el.roleId = undefined
        el.role = undefined
      }
    }
  }

  function addStepCommand(stepId: string, commandText: string, executorRoleId: string = '', beatType: StepCommand['beatType'] = 'instant'): StepCommand {
    const newCommand: StepCommand = {
      id: generateId('cmd'),
      stepId,
      commandText,
      executorRoleId,
      beatType,
      waitConditions: [],
    }
    stepCommands.value.push(newCommand)
    return newCommand
  }

  function updateStepCommand(commandId: string, updates: Partial<StepCommand>) {
    const index = stepCommands.value.findIndex(c => c.id === commandId)
    if (index !== -1) {
      stepCommands.value[index] = { ...stepCommands.value[index], ...updates }
    }
  }

  function deleteStepCommand(commandId: string) {
    const index = stepCommands.value.findIndex(c => c.id === commandId)
    if (index !== -1) {
      stepCommands.value.splice(index, 1)
    }
  }

  function addWaitCondition(commandId: string, condition: BeatCondition) {
    const cmd = stepCommands.value.find(c => c.id === commandId)
    if (cmd) {
      cmd.waitConditions.push(condition)
    }
  }

  function updateWaitCondition(commandId: string, conditionIndex: number, updates: Partial<BeatCondition>) {
    const cmd = stepCommands.value.find(c => c.id === commandId)
    if (cmd && cmd.waitConditions[conditionIndex]) {
      cmd.waitConditions[conditionIndex] = { ...cmd.waitConditions[conditionIndex], ...updates }
    }
  }

  function deleteWaitCondition(commandId: string, conditionIndex: number) {
    const cmd = stepCommands.value.find(c => c.id === commandId)
    if (cmd && cmd.waitConditions[conditionIndex]) {
      cmd.waitConditions.splice(conditionIndex, 1)
    }
  }

  function createSnapshot(schemeId: string): SchemeSnapshot {
    const snapshot: SchemeSnapshot = {
      id: generateId('snap'),
      schemeId,
      scene: currentScene.value,
      timestamp: Date.now(),
      name: schemeName.value,
      elements: JSON.parse(JSON.stringify(elements.value)),
      currentStepIndex: currentStepIndex.value,
      roles: JSON.parse(JSON.stringify(roles.value)),
      stepCommands: JSON.parse(JSON.stringify(stepCommands.value)),
    }
    return snapshot
  }

  function saveCurrentScheme() {
    const now = Date.now()
    let scheme: CeremonyScheme

    if (currentSchemeId.value) {
      scheme = {
        id: currentSchemeId.value,
        name: schemeName.value,
        scene: currentScene.value,
        createdAt: now,
        updatedAt: now,
        elements: JSON.parse(JSON.stringify(elements.value)),
        currentStepIndex: currentStepIndex.value,
        roles: JSON.parse(JSON.stringify(roles.value)),
        stepCommands: JSON.parse(JSON.stringify(stepCommands.value)),
      }
      const allSchemes = loadSchemes()
      const existingIndex = allSchemes.findIndex(s => s.id === scheme.id)
      if (existingIndex !== -1) {
        scheme.createdAt = allSchemes[existingIndex].createdAt
        allSchemes[existingIndex] = scheme
        saveSchemes(allSchemes)
      } else {
        addScheme(scheme)
      }
    } else {
      scheme = {
        id: generateId('scheme'),
        name: schemeName.value,
        scene: currentScene.value,
        createdAt: now,
        updatedAt: now,
        elements: JSON.parse(JSON.stringify(elements.value)),
        currentStepIndex: currentStepIndex.value,
        roles: JSON.parse(JSON.stringify(roles.value)),
        stepCommands: JSON.parse(JSON.stringify(stepCommands.value)),
      }
      currentSchemeId.value = scheme.id
      addScheme(scheme)
    }

    const snapshot = createSnapshot(scheme.id)
    addSnapshot(snapshot)

    return scheme
  }

  function loadScheme(scheme: CeremonyScheme) {
    stopPlay()
    currentScene.value = scheme.scene
    elements.value = JSON.parse(JSON.stringify(scheme.elements || []))
    roles.value = JSON.parse(JSON.stringify(scheme.roles || createDefaultRoles(scheme.scene)))
    stepCommands.value = JSON.parse(JSON.stringify(scheme.stepCommands || createDefaultStepCommands(scheme.scene)))
    currentStepIndex.value = scheme.currentStepIndex || 0
    schemeName.value = scheme.name
    currentSchemeId.value = scheme.id
    selectedElementId.value = null
    highlightedRoleId.value = null
  }

  function loadSnapshot(snapshot: SchemeSnapshot) {
    stopPlay()
    setScene(snapshot.scene)
    elements.value = JSON.parse(JSON.stringify(snapshot.elements || []))
    roles.value = JSON.parse(JSON.stringify(snapshot.roles || []))
    stepCommands.value = JSON.parse(JSON.stringify(snapshot.stepCommands || []))
    currentStepIndex.value = snapshot.currentStepIndex
    schemeName.value = `${snapshot.name} (快照恢复)`
    currentSchemeId.value = snapshot.schemeId
    selectedElementId.value = null
    highlightedRoleId.value = null
  }

  function deleteSavedScheme(schemeId: string) {
    deleteScheme(schemeId)
    if (currentSchemeId.value === schemeId) {
      currentSchemeId.value = null
    }
  }

  function getAllSchemes(): CeremonyScheme[] {
    return loadSchemes()
  }

  function getSchemeSnapshots(schemeId: string): SchemeSnapshot[] {
    return getSnapshotsBySchemeId(schemeId)
  }

  function restoreSnapshot(snapshotId: string): boolean {
    const snapshot = getSnapshotById(snapshotId)
    if (snapshot) {
      loadSnapshot(snapshot)
      return true
    }
    return false
  }

  function deleteSnapshotById(snapshotId: string): void {
    removeSnapshot(snapshotId)
  }

  function compareSchemes(schemeA: CeremonyScheme, schemeB: CeremonyScheme): CompareResult {
    const templateA = getTemplateByScene(schemeA.scene)
    const templateB = getTemplateByScene(schemeB.scene)
    const stepsA = templateA?.steps || []
    const stepsB = templateB?.steps || []
    const cmdsA = schemeA.stepCommands || []
    const cmdsB = schemeB.stepCommands || []

    function deepCmdEq(a: any, b: any): boolean {
      if (!a && !b) return true
      if (!a || !b) return false
      if (a.commandText !== b.commandText) return false
      if (a.executorRoleId !== b.executorRoleId) return false
      if (a.beatType !== b.beatType) return false
      if (a.beatValue !== b.beatValue) return false
      if (a.beatCountdown !== b.beatCountdown) return false
      if (a.notes !== b.notes) return false
      const wa = a.waitConditions || []
      const wb = b.waitConditions || []
      if (wa.length !== wb.length) return false
      for (let i = 0; i < wa.length; i++) {
        if (wa[i].type !== wb[i].type) return false
        if (wa[i].value !== wb[i].value) return false
        if (wa[i].description !== wb[i].description) return false
        const ra = wa[i].waitRoleIds || []
        const rb = wb[i].waitRoleIds || []
        if (ra.length !== rb.length || ra.some((x: string) => !rb.includes(x))) return false
        const sa = wa[i].waitStepIds || []
        const sb = wb[i].waitStepIds || []
        if (sa.length !== sb.length || sa.some((x: string) => !sb.includes(x))) return false
      }
      return true
    }

    function stepCommandsChanged(stepId: string): boolean {
      const ca = cmdsA.filter(c => c.stepId === stepId)
      const cb = cmdsB.filter(c => c.stepId === stepId)
      if (ca.length !== cb.length) return true
      const allIds = new Set([...ca.map(c => c.id), ...cb.map(c => c.id)])
      for (const id of allIds) {
        const a = ca.find(c => c.id === id)
        const b = cb.find(c => c.id === id)
        if (!deepCmdEq(a, b)) return true
      }
      return false
    }

    const elementDiffsA: ElementDiff[] = []
    const elementDiffsB: ElementDiff[] = []
    const stepDiffsA: StepDiff[] = []
    const stepDiffsB: StepDiff[] = []

    const allElementIds = new Set([
      ...schemeA.elements.map(e => e.id),
      ...schemeB.elements.map(e => e.id),
    ])

    for (const id of allElementIds) {
      const elA = schemeA.elements.find(e => e.id === id)
      const elB = schemeB.elements.find(e => e.id === id)

      if (elA && elB) {
        const dx = elB.x - elA.x
        const dy = elB.y - elA.y
        const hasMoved = Math.abs(dx) > 1 || Math.abs(dy) > 1
        const hasSizeChanged = elA.width !== elB.width || elA.height !== elB.height
        const hasRotationChanged = elA.rotation !== elB.rotation
        const hasLabelChanged = elA.label !== elB.label
        const hasRoleChanged = elA.roleId !== elB.roleId
        const isChanged = hasMoved || hasSizeChanged || hasRotationChanged || hasLabelChanged || hasRoleChanged

        const diffTypeA: DiffType = isChanged ? 'moved' : 'unchanged'
        const diffTypeB: DiffType = isChanged ? 'moved' : 'unchanged'

        elementDiffsA.push({
          elementId: id,
          element: elA,
          baseElement: elB,
          diffType: diffTypeA,
          displacement: hasMoved ? { dx: -dx, dy: -dy } : undefined,
        })
        elementDiffsB.push({
          elementId: id,
          element: elB,
          baseElement: elA,
          diffType: diffTypeB,
          displacement: hasMoved ? { dx, dy } : undefined,
        })
      } else if (elA && !elB) {
        elementDiffsA.push({
          elementId: id,
          element: elA,
          diffType: 'removed',
        })
        elementDiffsB.push({
          elementId: id,
          baseElement: elA,
          diffType: 'removed',
        })
      } else if (!elA && elB) {
        elementDiffsA.push({
          elementId: id,
          baseElement: elB,
          diffType: 'added',
        })
        elementDiffsB.push({
          elementId: id,
          element: elB,
          diffType: 'added',
        })
      }
    }

    const allStepIds = new Set([
      ...stepsA.map(s => s.id),
      ...stepsB.map(s => s.id),
    ])

    for (const id of allStepIds) {
      const stepA = stepsA.find(s => s.id === id)
      const stepB = stepsB.find(s => s.id === id)

      if (stepA && stepB) {
        const changedFields: string[] = []
        if (stepA.title !== stepB.title) changedFields.push('title')
        if (stepA.description !== stepB.description) changedFields.push('description')
        if (stepA.direction !== stepB.direction) changedFields.push('direction')
        if (stepA.gesture !== stepB.gesture) changedFields.push('gesture')
        if (stepA.duration !== stepB.duration) changedFields.push('duration')
        if (stepA.order !== stepB.order) changedFields.push('order')
        if (stepCommandsChanged(id)) changedFields.push('commands')

        const diffType: DiffType = changedFields.length > 0 ? 'moved' : 'unchanged'

        stepDiffsA.push({
          stepId: id,
          step: stepA,
          baseStep: stepB,
          diffType,
          changedFields: changedFields.length > 0 ? changedFields : undefined,
        })
        stepDiffsB.push({
          stepId: id,
          step: stepB,
          baseStep: stepA,
          diffType,
          changedFields: changedFields.length > 0 ? changedFields : undefined,
        })
      } else if (stepA && !stepB) {
        stepDiffsA.push({
          stepId: id,
          step: stepA,
          diffType: 'removed',
        })
        stepDiffsB.push({
          stepId: id,
          baseStep: stepA,
          diffType: 'removed',
        })
      } else if (!stepA && stepB) {
        stepDiffsA.push({
          stepId: id,
          baseStep: stepB,
          diffType: 'added',
        })
        stepDiffsB.push({
          stepId: id,
          step: stepB,
          diffType: 'added',
        })
      }
    }

    stepDiffsA.sort((a, b) => {
      const orderA = a.step?.order ?? a.baseStep?.order ?? 999
      const orderB = b.step?.order ?? b.baseStep?.order ?? 999
      return orderA - orderB
    })
    stepDiffsB.sort((a, b) => {
      const orderA = a.step?.order ?? a.baseStep?.order ?? 999
      const orderB = b.step?.order ?? b.baseStep?.order ?? 999
      return orderA - orderB
    })

    return {
      schemeA,
      schemeB,
      elementDiffsA,
      elementDiffsB,
      stepDiffsA,
      stepDiffsB,
    }
  }

  function startCompare(schemeA: CeremonyScheme, schemeB: CeremonyScheme): boolean {
    if (schemeA.scene !== schemeB.scene) {
      return false
    }
    compareSchemeA.value = schemeA
    compareSchemeB.value = schemeB
    compareResult.value = compareSchemes(schemeA, schemeB)
    setViewMode('compare')
    return true
  }

  function updatePrintSettings(settings: Partial<PrintSettings>) {
    printSettings.value = { ...printSettings.value, ...settings }
  }

  function initDefault() {
    setScene('welcome')
  }

  return {
    currentScene,
    viewMode,
    elements,
    selectedElementId,
    currentStepIndex,
    schemeName,
    isPlaying,
    roles,
    stepCommands,
    highlightedRoleId,
    currentTemplate,
    steps,
    currentStep,
    selectedElement,
    involvedElementIds,
    currentSchemeId,
    isCompareMode,
    compareViewMode,
    compareSchemeA,
    compareSchemeB,
    compareResult,
    printSettings,
    currentStepCommands,
    sortedRoles,
    setScene,
    setViewMode,
    setCompareViewMode,
    exitCompareMode,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    setStepIndex,
    nextStep,
    prevStep,
    bringToFront,
    isInvolved,
    startPlay,
    stopPlay,
    togglePlay,
    getElementLabel,
    saveCurrentScheme,
    loadScheme,
    loadSnapshot,
    deleteSavedScheme,
    getAllSchemes,
    getSchemeSnapshots,
    restoreSnapshot,
    deleteSnapshotById,
    startCompare,
    updatePrintSettings,
    initDefault,
    getRoleById,
    getRoleName,
    getRoleColor,
    getCommandsByStepId,
    getElementsByRoleId,
    setHighlightedRole,
    isElementHighlighted,
    addRole,
    updateRole,
    deleteRole,
    reorderRole,
    bindElementToRole,
    addStepCommand,
    updateStepCommand,
    deleteStepCommand,
    addWaitCondition,
    updateWaitCondition,
    deleteWaitCondition,
  }
}
