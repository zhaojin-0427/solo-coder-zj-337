import { ref, computed, reactive } from 'vue'
import type { CeremonyScene, CanvasElement, CeremonyStep, ViewMode, CeremonyScheme } from '@/types'
import { ceremonyTemplates, getTemplateByScene, createDefaultElements } from '@/data/templates'
import { generateId } from '@/utils/id'
import { loadSchemes, saveSchemes, addScheme, updateScheme, deleteScheme } from '@/utils/storage'

const currentScene = ref<CeremonyScene>('welcome')
const viewMode = ref<ViewMode>('top')
const elements = ref<CanvasElement[]>([])
const selectedElementId = ref<string | null>(null)
const currentStepIndex = ref(0)
const schemeName = ref('未命名方案')
const isPlaying = ref(false)

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

  function setScene(scene: CeremonyScene) {
    currentScene.value = scene
    elements.value = createDefaultElements(scene)
    currentStepIndex.value = 0
    selectedElementId.value = null
    schemeName.value = `${currentTemplate.value?.name || '方案'} - ${new Date().toLocaleDateString()}`
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
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

  function saveCurrentScheme() {
    const scheme: CeremonyScheme = {
      id: generateId('scheme'),
      name: schemeName.value,
      scene: currentScene.value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      elements: JSON.parse(JSON.stringify(elements.value)),
      currentStepIndex: currentStepIndex.value,
    }
    addScheme(scheme)
    return scheme
  }

  function loadScheme(scheme: CeremonyScheme) {
    currentScene.value = scheme.scene
    elements.value = JSON.parse(JSON.stringify(scheme.elements))
    currentStepIndex.value = scheme.currentStepIndex
    schemeName.value = scheme.name
    selectedElementId.value = null
  }

  function deleteSavedScheme(schemeId: string) {
    deleteScheme(schemeId)
  }

  function getAllSchemes(): CeremonyScheme[] {
    return loadSchemes()
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
    currentTemplate,
    steps,
    currentStep,
    selectedElement,
    involvedElementIds,
    setScene,
    setViewMode,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    setStepIndex,
    nextStep,
    prevStep,
    bringToFront,
    isInvolved,
    saveCurrentScheme,
    loadScheme,
    deleteSavedScheme,
    getAllSchemes,
    initDefault,
  }
}
