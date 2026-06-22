<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CanvasElement, CeremonyStep, ElementDiff } from '@/types'
import { materialItems } from '@/data/templates'

const props = defineProps<{
  elements: CanvasElement[]
  selectedElementId: string | null
  currentStep: CeremonyStep | null
  compareMode?: boolean
  elementDiffs?: ElementDiff[]
  showDirection?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'update-element', id: string, updates: Partial<CanvasElement>): void
  (e: 'add-element', type: string, x: number, y: number): void
  (e: 'delete-element', id: string): void
  (e: 'bring-to-front', id: string): void
}>()

const canvasRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dragElementId = ref<string | null>(null)
const isDragOver = ref(false)

const sortedElements = computed(() => {
  return [...props.elements].sort((a, b) => a.zIndex - b.zIndex)
})

const diffMap = computed(() => {
  const map = new Map<string, ElementDiff>()
  if (props.elementDiffs) {
    for (const diff of props.elementDiffs) {
      map.set(diff.elementId, diff)
    }
  }
  return map
})

const displacementArrows = computed(() => {
  const arrows: Array<{
    id: string
    fromX: number
    fromY: number
    toX: number
    toY: number
    dx: number
    dy: number
  }> = []
  if (props.elementDiffs) {
    for (const diff of props.elementDiffs) {
      if (diff.diffType === 'moved' && diff.displacement && diff.element && diff.baseElement) {
        const fromX = diff.element.x + diff.element.width / 2
        const fromY = diff.element.y + diff.element.height / 2
        const toX = diff.baseElement.x + diff.baseElement.width / 2
        const toY = diff.baseElement.y + diff.baseElement.height / 2
        arrows.push({
          id: diff.elementId,
          fromX,
          fromY,
          toX,
          toY,
          dx: diff.displacement.dx,
          dy: diff.displacement.dy,
        })
      }
    }
  }
  return arrows
})

const ghostElements = computed(() => {
  const ghosts: Array<{ element: CanvasElement }> = []
  if (props.elementDiffs && props.compareMode) {
    for (const diff of props.elementDiffs) {
      if (diff.diffType === 'added' && !diff.element && diff.baseElement) {
        ghosts.push({ element: diff.baseElement })
      }
      if (diff.diffType === 'removed' && !diff.element && diff.baseElement) {
        ghosts.push({ element: diff.baseElement })
      }
    }
  }
  return ghosts
})

const deliveryRoutePath = computed(() => {
  if (!props.currentStep?.deliveryRoute) return null
  
  const { from, to } = props.currentStep.deliveryRoute
  const fromEl = props.elements.find(el => el.id === from)
  const toEl = props.elements.find(el => el.id === to)
  
  if (!fromEl || !toEl) return null
  
  const fromX = fromEl.x + fromEl.width / 2
  const fromY = fromEl.y + fromEl.height / 2
  const toX = toEl.x + toEl.width / 2
  const toY = toEl.y + toEl.height / 2
  
  const midX = (fromX + toX) / 2
  const midY = Math.min(fromY, toY) - 60
  
  return {
    fromX,
    fromY,
    toX,
    toY,
    path: `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`,
    item: props.currentStep.deliveryRoute.item,
    midX,
    midY,
  }
})

function getElementIcon(type: string) {
  const item = materialItems.find(m => m.type === type)
  return item?.icon || 'square'
}

function getElementColor(type: string): string {
  if (type.startsWith('seat-main')) return '#8B4513'
  if (type.startsWith('seat-host')) return '#A0522D'
  if (type.startsWith('seat-guest')) return '#5F9EA0'
  if (type.startsWith('seat-secondary')) return '#708090'
  if (type.startsWith('table')) return '#BC8F8F'
  if (type.startsWith('mat')) return '#DEB887'
  if (type.startsWith('vessel')) return '#D4AF37'
  if (type === 'incense') return '#CD5C5C'
  if (type === 'candle') return '#F4A460'
  if (type === 'scroll') return '#8B7355'
  if (type === 'flower') return '#DB7093'
  return '#888'
}

function isInvolved(id: string): boolean {
  return props.currentStep?.involvedElements.includes(id) || false
}

function getDiffType(id: string): string | null {
  if (!props.compareMode) return null
  const diff = diffMap.value.get(id)
  return diff?.diffType || null
}

function getDiffLabel(id: string): string {
  const type = getDiffType(id)
  if (type === 'added') return '新增'
  if (type === 'removed') return '缺失'
  if (type === 'moved') return '位移'
  return ''
}

function handleCanvasClick(e: MouseEvent) {
  if (e.target === canvasRef.value) {
    emit('select', null)
  }
}

function handleElementMouseDown(e: MouseEvent, element: CanvasElement) {
  e.stopPropagation()
  emit('select', element.id)
  emit('bring-to-front', element.id)
  
  isDragging.value = true
  dragElementId.value = element.id
  dragOffset.value = {
    x: e.clientX - element.x,
    y: e.clientY - element.y,
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value || !dragElementId.value || !canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  let x = e.clientX - dragOffset.value.x
  let y = e.clientY - dragOffset.value.y
  
  const element = props.elements.find(el => el.id === dragElementId.value)
  if (element) {
    x = Math.max(0, Math.min(x, rect.width - element.width))
    y = Math.max(0, Math.min(y, rect.height - element.height))
  }
  
  emit('update-element', dragElementId.value, { x, y })
}

function handleMouseUp() {
  isDragging.value = false
  dragElementId.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  
  if (!e.dataTransfer || !canvasRef.value) return
  
  const data = e.dataTransfer.getData('application/json')
  if (!data) return
  
  try {
    const item = JSON.parse(data)
    const rect = canvasRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left - item.defaultWidth / 2
    const y = e.clientY - rect.top - item.defaultHeight / 2
    
    emit('add-element', item.type, x, y)
  } catch (err) {
    console.error('Failed to parse drop data:', err)
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!props.selectedElementId) return
  
  if (e.key === 'Delete' || e.key === 'Backspace') {
    emit('delete-element', props.selectedElementId)
  }
  
  const step = e.shiftKey ? 10 : 1
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const el = props.elements.find(e => e.id === props.selectedElementId)
    if (el) {
      emit('update-element', props.selectedElementId, { y: el.y - step })
    }
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const el = props.elements.find(e => e.id === props.selectedElementId)
    if (el) {
      emit('update-element', props.selectedElementId, { y: el.y + step })
    }
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    const el = props.elements.find(e => e.id === props.selectedElementId)
    if (el) {
      emit('update-element', props.selectedElementId, { x: el.x - step })
    }
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    const el = props.elements.find(e => e.id === props.selectedElementId)
    if (el) {
      emit('update-element', props.selectedElementId, { x: el.x + step })
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

function getCanvasElement(): HTMLDivElement | null {
  return canvasRef.value
}

defineExpose({
  getCanvasElement,
})
</script>

<template>
  <div
    ref="canvasRef"
    class="seating-canvas"
    :class="{ 'drag-over': isDragOver }"
    @click="handleCanvasClick"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="canvas-bg">
      <div class="grid-pattern"></div>
      <div class="paper-texture"></div>
    </div>
    
    <svg v-if="showDirection !== false" class="direction-indicator" viewBox="0 0 100 100">
      <text x="50" y="18" text-anchor="middle" class="dir-text">北</text>
      <text x="95" y="54" text-anchor="end" class="dir-text">东</text>
      <text x="50" y="98" text-anchor="middle" class="dir-text">南</text>
      <text x="5" y="54" text-anchor="start" class="dir-text">西</text>
    </svg>

    <div
      v-for="ghost in ghostElements"
      :key="'ghost-' + ghost.element.id"
      class="canvas-element ghost"
      :style="{
        left: ghost.element.x + 'px',
        top: ghost.element.y + 'px',
        width: ghost.element.width + 'px',
        height: ghost.element.height + 'px',
        zIndex: 1,
        transform: `rotate(${ghost.element.rotation}deg)`,
      }"
    >
      <div
        class="element-body ghost-body"
      >
        <div class="element-label ghost-label">{{ ghost.element.label }}</div>
      </div>
    </div>
    
    <div
      v-for="element in sortedElements"
      :key="element.id"
      class="canvas-element"
      :class="{
        selected: element.id === selectedElementId,
        involved: isInvolved(element.id),
        dragging: dragElementId === element.id,
        'diff-added': getDiffType(element.id) === 'added',
        'diff-removed': getDiffType(element.id) === 'removed',
        'diff-moved': getDiffType(element.id) === 'moved',
      }"
      :style="{
        left: element.x + 'px',
        top: element.y + 'px',
        width: element.width + 'px',
        height: element.height + 'px',
        zIndex: element.zIndex,
        transform: `rotate(${element.rotation}deg)`,
      }"
      @mousedown="!compareMode ? handleElementMouseDown($event, element) : null"
    >
      <div
        class="element-body"
        :style="{
          backgroundColor: getElementColor(element.type) + '20',
          borderColor: getElementColor(element.type),
        }"
      >
        <div class="element-icon" :style="{ color: getElementColor(element.type) }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect v-if="element.type.startsWith('seat')" x="3" y="3" width="18" height="18" rx="3" />
            <circle v-if="element.type === 'seat-main'" cx="12" cy="12" r="5" />
            <path v-if="element.type === 'seat-host'" d="M12 3v18M3 12h18" stroke-width="1.5" />
            <path v-if="element.type.startsWith('table')" d="M3 8h18v8H3z" />
            <rect v-if="element.type.startsWith('mat')" x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="2 2" />
            <circle v-if="element.type.startsWith('vessel')" cx="12" cy="13" r="7" />
            <path v-if="element.type.startsWith('vessel')" d="M8 8l2-3h4l2 3" />
            <path v-if="element.type === 'incense'" d="M12 3v4M9 7h6v10H9z" />
            <line v-if="element.type === 'candle'" x1="12" y1="4" x2="12" y2="20" stroke-width="3" />
            <path v-if="element.type === 'candle'" d="M12 4c-2 2-2 5 0 7 2-2 2-5 0-7z" />
            <rect v-if="element.type === 'scroll'" x="4" y="8" width="16" height="8" rx="1" />
            <circle v-if="element.type === 'scroll'" cx="4" cy="12" r="3" />
            <circle v-if="element.type === 'scroll'" cx="20" cy="12" r="3" />
            <path v-if="element.type === 'flower'" d="M12 8c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z" />
            <line v-if="element.type === 'flower'" x1="12" y1="16" x2="12" y2="21" />
          </svg>
        </div>
        <div class="element-label">{{ element.label }}</div>
        <div v-if="element.role" class="element-role">{{ element.role }}</div>
        <div v-if="compareMode && getDiffType(element.id) && getDiffType(element.id) !== 'unchanged'" class="diff-badge" :class="'diff-' + getDiffType(element.id)">
          {{ getDiffLabel(element.id) }}
        </div>
      </div>
      
      <div v-if="element.id === selectedElementId && !compareMode" class="resize-handle se"></div>
    </div>

    <svg v-if="compareMode && displacementArrows.length > 0" class="displacement-layer">
      <defs>
        <marker id="displacement-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#3498db" />
        </marker>
      </defs>
      <g v-for="arrow in displacementArrows" :key="'arr-' + arrow.id">
        <line
          :x1="arrow.fromX"
          :y1="arrow.fromY"
          :x2="arrow.toX"
          :y2="arrow.toY"
          stroke="#3498db"
          stroke-width="2"
          stroke-dasharray="6 4"
          marker-end="url(#displacement-arrow)"
        />
        <rect
          :x="(arrow.fromX + arrow.toX) / 2 - 35"
          :y="(arrow.fromY + arrow.toY) / 2 - 14"
          width="70"
          height="24"
          rx="4"
          fill="white"
          stroke="#3498db"
          stroke-width="1"
          opacity="0.95"
        />
        <text
          :x="(arrow.fromX + arrow.toX) / 2"
          :y="(arrow.fromY + arrow.toY) / 2 + 3"
          text-anchor="middle"
          font-size="11"
          fill="#2980b9"
          font-weight="500"
        >
          {{ arrow.dx > 0 ? '→' : arrow.dx < 0 ? '←' : '' }}{{ Math.abs(arrow.dx) }}px
          {{ arrow.dy > 0 ? '↓' : arrow.dy < 0 ? '↑' : '' }}{{ Math.abs(arrow.dy) }}px
        </text>
      </g>
    </svg>
    
    <svg v-if="deliveryRoutePath" class="route-layer">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#D4AF37" />
        </marker>
        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="1" />
        </linearGradient>
      </defs>
      
      <path
        :d="deliveryRoutePath.path"
        fill="none"
        stroke="url(#routeGradient)"
        stroke-width="3"
        stroke-dasharray="8 4"
        marker-end="url(#arrowhead)"
        class="route-path"
      />
      
      <g class="route-item-badge">
        <rect
          :x="deliveryRoutePath.midX - 35"
          :y="deliveryRoutePath.midY - 12"
          width="70"
          height="24"
          rx="12"
          fill="#fff"
          stroke="#D4AF37"
          stroke-width="2"
        />
        <text
          :x="deliveryRoutePath.midX"
          :y="deliveryRoutePath.midY + 4"
          text-anchor="middle"
          class="route-item-text"
        >
          {{ deliveryRoutePath.item }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.seating-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f0e6;
  cursor: default;
}

.seating-canvas.drag-over {
  background: #efe8d8;
}

.canvas-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 69, 19, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 69, 19, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.paper-texture {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(95, 158, 160, 0.05) 0%, transparent 50%);
}

.direction-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 60px;
  height: 60px;
  pointer-events: none;
  opacity: 0.4;
}

.dir-text {
  font-size: 10px;
  fill: #8B4513;
  font-weight: 500;
}

.canvas-element {
  position: absolute;
  cursor: grab;
  transition: box-shadow 0.2s ease;
}

.canvas-element:hover .element-body {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.canvas-element.selected .element-body {
  box-shadow: 0 0 0 2px #5F9EA0, 0 4px 16px rgba(95, 158, 160, 0.3);
}

.canvas-element.involved .element-body {
  animation: pulse-glow 2s ease-in-out infinite;
}

.canvas-element.dragging {
  cursor: grabbing;
  opacity: 0.8;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.2);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.4);
  }
}

.element-body {
  width: 100%;
  height: 100%;
  border: 2px solid;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px;
  box-sizing: border-box;
  background: #fffef9;
  transition: all 0.2s ease;
  user-select: none;
}

.element-icon {
  width: 50%;
  height: 50%;
  min-width: 20px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-icon svg {
  width: 100%;
  height: 100%;
}

.element-label {
  font-size: 10px;
  color: #4a4a4a;
  font-weight: 500;
  text-align: center;
  line-height: 1.1;
  white-space: nowrap;
}

.element-role {
  font-size: 9px;
  color: #888;
  text-align: center;
  line-height: 1;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #5F9EA0;
  border: 2px solid #fff;
  border-radius: 2px;
}

.resize-handle.se {
  right: -5px;
  bottom: -5px;
  cursor: se-resize;
}

.route-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.route-path {
  animation: dash-flow 1.5s linear infinite;
}

@keyframes dash-flow {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.route-item-text {
  font-size: 11px;
  fill: #8B6914;
  font-weight: 500;
}

.route-item-badge {
  filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
}

.canvas-element.diff-added .element-body {
  border-color: #27ae60 !important;
  border-width: 3px !important;
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2), 0 4px 12px rgba(39, 174, 96, 0.15) !important;
  animation: diff-pulse-green 2s ease-in-out infinite;
}

.canvas-element.diff-removed .element-body {
  border-color: #e74c3c !important;
  border-width: 3px !important;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2), 0 4px 12px rgba(231, 76, 60, 0.15) !important;
  opacity: 0.7;
  animation: diff-pulse-red 2s ease-in-out infinite;
}

.canvas-element.diff-moved .element-body {
  border-color: #f39c12 !important;
  border-width: 3px !important;
  box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.2), 0 4px 12px rgba(243, 156, 18, 0.15) !important;
  animation: diff-pulse-yellow 2s ease-in-out infinite;
}

@keyframes diff-pulse-green {
  0%, 100% { box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.2), 0 4px 12px rgba(39, 174, 96, 0.15); }
  50% { box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.3), 0 6px 16px rgba(39, 174, 96, 0.25); }
}

@keyframes diff-pulse-red {
  0%, 100% { box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2), 0 4px 12px rgba(231, 76, 60, 0.15); }
  50% { box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.3), 0 6px 16px rgba(231, 76, 60, 0.25); }
}

@keyframes diff-pulse-yellow {
  0%, 100% { box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.2), 0 4px 12px rgba(243, 156, 18, 0.15); }
  50% { box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.3), 0 6px 16px rgba(243, 156, 18, 0.25); }
}

.diff-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  z-index: 10;
  white-space: nowrap;
}

.diff-badge.diff-added {
  background: #27ae60;
}

.diff-badge.diff-removed {
  background: #e74c3c;
}

.diff-badge.diff-moved {
  background: #f39c12;
}

.displacement-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 90;
}

.canvas-element.ghost {
  pointer-events: none;
}

.ghost-body {
  background: repeating-linear-gradient(
    45deg,
    rgba(150, 150, 150, 0.1),
    rgba(150, 150, 150, 0.1) 4px,
    rgba(200, 200, 200, 0.15) 4px,
    rgba(200, 200, 200, 0.15) 8px
  ) !important;
  border: 2px dashed #999 !important;
  opacity: 0.5;
}

.ghost-label {
  color: #666 !important;
  font-style: italic;
}
</style>
