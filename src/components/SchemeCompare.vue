<script setup lang="ts">
import { computed } from 'vue'
import { X, Grid, GitBranch, ArrowLeftRight } from 'lucide-vue-next'
import SeatingCanvas from '@/components/SeatingCanvas.vue'
import FlowChartView from '@/components/FlowChartView.vue'
import type {
  CompareResult,
  CompareViewMode,
  CanvasElement,
  CeremonyStep,
  CeremonyTemplate,
} from '@/types'
import { getTemplateByScene } from '@/data/templates'

const props = defineProps<{
  compareResult: CompareResult | null
  compareViewMode: CompareViewMode
}>()

const emit = defineEmits<{
  (e: 'exit'): void
  (e: 'change-view', mode: CompareViewMode): void
}>()

const schemeA = computed(() => props.compareResult?.schemeA)
const schemeB = computed(() => props.compareResult?.schemeB)

const templateA = computed<CeremonyTemplate | undefined>(() => {
  if (!schemeA.value) return undefined
  return getTemplateByScene(schemeA.value.scene)
})
const templateB = computed<CeremonyTemplate | undefined>(() => {
  if (!schemeB.value) return undefined
  return getTemplateByScene(schemeB.value.scene)
})

const stepsA = computed<CeremonyStep[]>(() => templateA.value?.steps || [])
const stepsB = computed<CeremonyStep[]>(() => templateB.value?.steps || [])

const elementsA = computed<CanvasElement[]>(() => schemeA.value?.elements || [])
const elementsB = computed<CanvasElement[]>(() => schemeB.value?.elements || [])

const rolesA = computed(() => schemeA.value?.roles || [])
const rolesB = computed(() => schemeB.value?.roles || [])
const stepCommandsA = computed(() => schemeA.value?.stepCommands || [])
const stepCommandsB = computed(() => schemeB.value?.stepCommands || [])

const elementDiffsA = computed(() => props.compareResult?.elementDiffsA || [])
const elementDiffsB = computed(() => props.compareResult?.elementDiffsB || [])

const stepDiffsA = computed(() => props.compareResult?.stepDiffsA || [])
const stepDiffsB = computed(() => props.compareResult?.stepDiffsB || [])

function deepCompareCommands(a: any, b: any): boolean {
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

const summary = computed(() => {
  if (!props.compareResult) return null
  const addedA = props.compareResult.elementDiffsA.filter(d => d.diffType === 'added').length
  const removedA = props.compareResult.elementDiffsA.filter(d => d.diffType === 'removed').length
  const movedA = props.compareResult.elementDiffsA.filter(d => d.diffType === 'moved').length
  const stepAddedA = props.compareResult.stepDiffsA.filter(d => d.diffType === 'added').length
  const stepRemovedA = props.compareResult.stepDiffsA.filter(d => d.diffType === 'removed').length
  const stepChangedA = props.compareResult.stepDiffsA.filter(d => d.diffType === 'moved').length
  const roleDiff = (rolesA.value.length !== rolesB.value.length) ? true : 
    rolesA.value.some((r, i) => {
      const rb = rolesB.value[i]
      return !rb || r.name !== rb.name || r.color !== rb.color || r.description !== rb.description
    })
  
  let cmdAdded = 0
  let cmdRemoved = 0
  let cmdChanged = 0
  const allCmdIds = new Set([
    ...stepCommandsA.value.map(c => c.id),
    ...stepCommandsB.value.map(c => c.id),
  ])
  for (const id of allCmdIds) {
    const cA = stepCommandsA.value.find(c => c.id === id)
    const cB = stepCommandsB.value.find(c => c.id === id)
    if (cA && cB) {
      if (!deepCompareCommands(cA, cB)) cmdChanged++
    } else if (cA && !cB) {
      cmdRemoved++
    } else {
      cmdAdded++
    }
  }
  const cmdDiff = (cmdAdded + cmdRemoved + cmdChanged) > 0
  
  return {
    elements: { added: addedA, removed: removedA, moved: movedA },
    steps: { added: stepAddedA, removed: stepRemovedA, changed: stepChangedA },
    roleDiff,
    cmdDiff,
    commands: { added: cmdAdded, removed: cmdRemoved, changed: cmdChanged, totalA: stepCommandsA.value.length, totalB: stepCommandsB.value.length },
  }
})
</script>

<template>
  <div class="scheme-compare" v-if="compareResult">
    <div class="compare-header">
      <div class="compare-header-left">
        <ArrowLeftRight class="w-5 h-5" />
        <span class="compare-title">方案对比与复盘</span>
      </div>
      
      <div class="compare-tabs">
        <button
          class="compare-tab"
          :class="{ active: compareViewMode === 'top' }"
          @click="emit('change-view', 'top')"
        >
          <Grid class="w-4 h-4" />
          俯视图对比
        </button>
        <button
          class="compare-tab"
          :class="{ active: compareViewMode === 'flow' }"
          @click="emit('change-view', 'flow')"
        >
          <GitBranch class="w-4 h-4" />
          流程图对比
        </button>
      </div>
      
      <div class="compare-header-right">
        <button class="exit-btn" @click="emit('exit')">
          <X class="w-4 h-4" />
          退出对比
        </button>
      </div>
    </div>

    <div class="compare-summary" v-if="summary">
      <div class="summary-item">
        <span class="summary-label">席位/器物</span>
        <span class="summary-tags">
          <span v-if="summary.elements.added > 0" class="summary-tag added">
            +{{ summary.elements.added }} 新增
          </span>
          <span v-if="summary.elements.removed > 0" class="summary-tag removed">
            -{{ summary.elements.removed }} 缺失
          </span>
          <span v-if="summary.elements.moved > 0" class="summary-tag moved">
            ~{{ summary.elements.moved }} 位移
          </span>
          <span v-if="summary.elements.added === 0 && summary.elements.removed === 0 && summary.elements.moved === 0" class="summary-tag unchanged">
            无差异
          </span>
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">礼序步骤</span>
        <span class="summary-tags">
          <span v-if="summary.steps.added > 0" class="summary-tag added">
            +{{ summary.steps.added }} 新增
          </span>
          <span v-if="summary.steps.removed > 0" class="summary-tag removed">
            -{{ summary.steps.removed }} 移除
          </span>
          <span v-if="summary.steps.changed > 0" class="summary-tag moved">
            ~{{ summary.steps.changed }} 变更
          </span>
          <span v-if="summary.steps.added === 0 && summary.steps.removed === 0 && summary.steps.changed === 0" class="summary-tag unchanged">
            无差异
          </span>
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">排练角色</span>
        <span class="summary-tags">
          <span v-if="summary.roleDiff" class="summary-tag moved">
            方案A {{ rolesA.length }}人 / 方案B {{ rolesB.length }}人
          </span>
          <span v-else class="summary-tag unchanged">
            无差异（{{ rolesA.length }}人）
          </span>
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">口令编排</span>
        <span class="summary-tags">
          <span v-if="summary.commands.added > 0" class="summary-tag added">
            +{{ summary.commands.added }} 新增
          </span>
          <span v-if="summary.commands.removed > 0" class="summary-tag removed">
            -{{ summary.commands.removed }} 移除
          </span>
          <span v-if="summary.commands.changed > 0" class="summary-tag moved">
            ~{{ summary.commands.changed }} 变更
          </span>
          <span v-if="summary.cmdDiff === false" class="summary-tag unchanged">
            无差异（{{ summary.commands.totalA }}条）
          </span>
        </span>
      </div>
    </div>

    <div class="compare-body">
      <div class="compare-pane pane-a">
        <div class="pane-header pane-a-header">
          <div class="pane-indicator a"></div>
          <div class="pane-info">
            <div class="pane-name">{{ schemeA?.name || '方案 A' }}</div>
            <div class="pane-meta">
              {{ schemeA?.scene === 'welcome' ? '迎宾礼' : schemeA?.scene === 'tea' ? '敬茶礼' : schemeA?.scene === 'capping' ? '冠礼' : '祭礼' }}
            </div>
          </div>
        </div>
        <div class="pane-content">
          <template v-if="compareViewMode === 'top'">
            <SeatingCanvas
              :elements="elementsA"
              :selected-element-id="null"
              :current-step="null"
              :compare-mode="true"
              :element-diffs="elementDiffsA"
              :highlighted-role-id="null"
              :roles="rolesA"
            />
          </template>
          <template v-else>
            <FlowChartView
              :steps="stepsA"
              :current-step-index="-1"
              :elements="elementsA"
              :compare-mode="true"
              :step-diffs="stepDiffsA"
              :step-commands="stepCommandsA"
              :roles="rolesA"
            />
          </template>
        </div>
      </div>

      <div class="compare-divider">
        <div class="divider-label">VS</div>
      </div>

      <div class="compare-pane pane-b">
        <div class="pane-header pane-b-header">
          <div class="pane-indicator b"></div>
          <div class="pane-info">
            <div class="pane-name">{{ schemeB?.name || '方案 B' }}</div>
            <div class="pane-meta">
              {{ schemeB?.scene === 'welcome' ? '迎宾礼' : schemeB?.scene === 'tea' ? '敬茶礼' : schemeB?.scene === 'capping' ? '冠礼' : '祭礼' }}
            </div>
          </div>
        </div>
        <div class="pane-content">
          <template v-if="compareViewMode === 'top'">
            <SeatingCanvas
              :elements="elementsB"
              :selected-element-id="null"
              :current-step="null"
              :compare-mode="true"
              :element-diffs="elementDiffsB"
              :highlighted-role-id="null"
              :roles="rolesB"
            />
          </template>
          <template v-else>
            <FlowChartView
              :steps="stepsB"
              :current-step-index="-1"
              :elements="elementsB"
              :compare-mode="true"
              :step-diffs="stepDiffsB"
              :step-commands="stepCommandsB"
              :roles="rolesB"
            />
          </template>
        </div>
      </div>
    </div>

    <div class="compare-legend">
      <div class="legend-title">图例说明</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-dot added"></span>
          <span class="legend-label">新增</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot removed"></span>
          <span class="legend-label">缺失/已移除</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot moved"></span>
          <span class="legend-label">位移/内容变更</span>
        </div>
        <div class="legend-item">
          <span class="legend-ghost"></span>
          <span class="legend-label">对方方案中存在</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scheme-compare {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f0eadd;
  overflow: hidden;
}

.compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fdfaf4;
  border-bottom: 1px solid rgba(139, 69, 19, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  flex-shrink: 0;
}

.compare-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5F9EA0;
}

.compare-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
}

.compare-tabs {
  display: flex;
  background: #f0eadd;
  border-radius: 10px;
  padding: 4px;
}

.compare-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #8B4513;
  cursor: pointer;
  transition: all 0.2s ease;
}

.compare-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.compare-tab.active {
  background: #fff;
  color: #5F9EA0;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.exit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exit-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.compare-summary {
  display: flex;
  gap: 30px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(139, 69, 19, 0.08);
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.summary-label {
  font-weight: 500;
  color: #5c3317;
  min-width: 70px;
}

.summary-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.summary-tag {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.summary-tag.added {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
}

.summary-tag.removed {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.summary-tag.moved {
  background: rgba(243, 156, 18, 0.15);
  color: #f39c12;
}

.summary-tag.unchanged {
  background: rgba(150, 150, 150, 0.15);
  color: #888;
}

.compare-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.compare-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.pane-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  flex-shrink: 0;
}

.pane-a-header {
  background: rgba(95, 158, 160, 0.08);
}

.pane-b-header {
  background: rgba(139, 69, 19, 0.06);
}

.pane-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pane-indicator.a {
  background: #5F9EA0;
}

.pane-indicator.b {
  background: #8B4513;
}

.pane-info {
  flex: 1;
  min-width: 0;
}

.pane-name {
  font-size: 14px;
  font-weight: 600;
  color: #2C2C2C;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pane-meta {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.pane-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.compare-divider {
  width: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0eadd;
  border-left: 1px dashed rgba(139, 69, 19, 0.15);
  border-right: 1px dashed rgba(139, 69, 19, 0.15);
}

.divider-label {
  width: 40px;
  height: 40px;
  background: #fff;
  border: 2px solid rgba(139, 69, 19, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #8B4513;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
}

.compare-legend {
  padding: 10px 20px;
  background: #fdfaf4;
  border-top: 1px solid rgba(139, 69, 19, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: #5c3317;
}

.legend-items {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.added {
  background: #27ae60;
}

.legend-dot.removed {
  background: #e74c3c;
}

.legend-dot.moved {
  background: #f39c12;
}

.legend-ghost {
  width: 16px;
  height: 12px;
  background: repeating-linear-gradient(
    45deg,
    rgba(150, 150, 150, 0.3),
    rgba(150, 150, 150, 0.3) 2px,
    rgba(200, 200, 200, 0.5) 2px,
    rgba(200, 200, 200, 0.5) 4px
  );
  border: 1px dashed #999;
  border-radius: 2px;
}
</style>
