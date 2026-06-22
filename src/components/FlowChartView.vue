<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, User, Droplets, Coffee, Crown, Flame, Users, Clock, MessageSquare } from 'lucide-vue-next'
import type { CeremonyStep, CanvasElement, StepDiff, StepCommand, RehearsalRole } from '@/types'

const props = defineProps<{
  steps: CeremonyStep[]
  currentStepIndex: number
  elements: CanvasElement[]
  compareMode?: boolean
  stepDiffs?: StepDiff[]
  showDeliveryRoute?: boolean
  stepCommands: StepCommand[]
  roles: RehearsalRole[]
}>()

const emit = defineEmits<{
  (e: 'step-change', index: number): void
}>()

const iconMap: Record<string, any> = {
  '揖礼': User,
  '沃盥': Droplets,
  '献茶': Coffee,
  '加冠': Crown,
  '祭祀': Flame,
}

function getStepIcon(step: CeremonyStep) {
  if (step.gesture && iconMap[step.gesture]) {
    return iconMap[step.gesture]
  }
  return User
}

function getElementLabel(id: string): string {
  const el = props.elements.find(e => e.id === id)
  return el?.label || id
}

const currentStep = computed(() => props.steps[props.currentStepIndex] || null)

const diffMap = computed(() => {
  const map = new Map<string, StepDiff>()
  if (props.stepDiffs) {
    for (const diff of props.stepDiffs) {
      map.set(diff.stepId, diff)
    }
  }
  return map
})

const ghostSteps = computed(() => {
  const ghosts: Array<{ step: CeremonyStep }> = []
  if (props.stepDiffs && props.compareMode) {
    for (const diff of props.stepDiffs) {
      if (!diff.step && diff.baseStep) {
        ghosts.push({ step: diff.baseStep })
      }
    }
  }
  return ghosts
})

function getStepDiffType(stepId: string): string | null {
  if (!props.compareMode) return null
  const diff = diffMap.value.get(stepId)
  return diff?.diffType || null
}

function getStepDiffLabel(stepId: string): string {
  const type = getStepDiffType(stepId)
  if (type === 'added') return '新增步骤'
  if (type === 'removed') return '移除步骤'
  if (type === 'moved') return '内容变更'
  return ''
}

function getStepChangedFields(stepId: string): string[] {
  if (!props.compareMode) return []
  const diff = diffMap.value.get(stepId)
  return diff?.changedFields || []
}

function getCommandsByStepId(stepId: string): StepCommand[] {
  return props.stepCommands.filter(c => c.stepId === stepId)
}

function getRoleName(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.name || ''
}

function getRoleColor(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.color || '#888'
}

function getStepExecutors(stepId: string): string[] {
  const cmds = getCommandsByStepId(stepId)
  const executorIds = new Set<string>()
  cmds.forEach(c => { if (c.executorRoleId) executorIds.add(c.executorRoleId) })
  return Array.from(executorIds)
}

function formatBeat(cmd: StepCommand): string {
  switch (cmd.beatType) {
    case 'instant': return '立即'
    case 'countdown': return cmd.beatCountdown ? `${cmd.beatCountdown}拍后` : '倒计时'
    case 'signal': return cmd.beatValue || '听信号'
    case 'previous-finish': return '前序完成'
    case 'manual': return '手动'
    default: return ''
  }
}

const fieldLabelMap: Record<string, string> = {
  title: '名称',
  description: '描述',
  direction: '方向',
  gesture: '礼仪',
  duration: '时长',
  order: '顺序',
  roles: '角色',
  commands: '口令',
}
</script>

<template>
  <div class="flow-chart">
    <div class="flow-header">
      <h3 class="flow-title">礼序流程图</h3>
      <p class="flow-subtitle">按顺序执行下列仪节</p>
    </div>
    
    <div class="flow-container">
      <div
        v-for="ghost in ghostSteps"
        :key="'ghost-' + ghost.step.id"
        class="flow-node-wrapper"
      >
        <div class="flow-node ghost-node">
          <div class="node-number ghost-number">{{ ghost.step.order }}</div>
          <div class="node-icon ghost-icon">
            <component :is="getStepIcon(ghost.step)" class="w-5 h-5" />
          </div>
          <div class="node-title">{{ ghost.step.title }}</div>
          <div class="diff-badge diff-removed">已移除</div>
        </div>
        <div class="flow-connector">
          <ArrowRight class="w-5 h-5" style="opacity: 0.3" />
        </div>
      </div>
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="flow-node-wrapper"
      >
        <div
          class="flow-node"
          :class="{
            active: !compareMode && index === currentStepIndex,
            done: !compareMode && index < currentStepIndex,
            'diff-added': getStepDiffType(step.id) === 'added',
            'diff-removed': getStepDiffType(step.id) === 'removed',
            'diff-moved': getStepDiffType(step.id) === 'moved',
          }"
          @click="!compareMode ? emit('step-change', index) : null"
        >
          <div class="node-number">{{ step.order }}</div>
          <div class="node-icon">
            <component :is="getStepIcon(step)" class="w-5 h-5" />
          </div>
          <div class="node-title">{{ step.title }}</div>
          <div class="node-gesture">{{ step.gesture }}</div>
          <div v-if="!compareMode && getStepExecutors(step.id).length > 0" class="node-executors">
            <Users class="w-2.5 h-2.5" />
            <div class="executor-dots">
              <span
                v-for="eid in getStepExecutors(step.id)"
                :key="eid"
                class="executor-dot"
                :style="{ backgroundColor: getRoleColor(eid) }"
                :title="getRoleName(eid)"
              />
            </div>
            <span class="cmd-count">{{ getCommandsByStepId(step.id).length }}</span>
          </div>
          <div v-if="compareMode && getStepDiffType(step.id) && getStepDiffType(step.id) !== 'unchanged'" class="diff-badge" :class="'diff-' + getStepDiffType(step.id)">
            {{ getStepDiffLabel(step.id) }}
          </div>
          <div v-if="compareMode && getStepChangedFields(step.id).length > 0" class="changed-fields">
            {{ getStepChangedFields(step.id).map(f => fieldLabelMap[f] || f).join('、') }}
          </div>
        </div>
        
        <div v-if="index < steps.length - 1" class="flow-connector">
          <ArrowRight class="w-5 h-5" />
        </div>
      </div>
    </div>
    
    <div v-if="currentStep && !compareMode" class="flow-detail">
      <div class="detail-header">
        <span class="detail-badge">第 {{ currentStepIndex + 1 }} 步</span>
        <span class="detail-title">{{ currentStep.title }}</span>
      </div>
      <p class="detail-desc">{{ currentStep.description }}</p>
      <div v-if="showDeliveryRoute !== false && currentStep.deliveryRoute" class="detail-route">
        <strong>器物递送：</strong>
        <span>{{ getElementLabel(currentStep.deliveryRoute.from) }}</span>
        <span class="route-arrow">→</span>
        <span class="route-item">{{ getElementLabel(currentStep.deliveryRoute.item) }}</span>
        <span class="route-arrow">→</span>
        <span>{{ getElementLabel(currentStep.deliveryRoute.to) }}</span>
      </div>
      <div v-if="getCommandsByStepId(currentStep.id).length > 0" class="detail-commands">
        <div class="dc-title">
          <MessageSquare class="w-4 h-4" />
          <span>本步口令（{{ getCommandsByStepId(currentStep.id).length }} 条）</span>
        </div>
        <div class="dc-table">
          <div
            v-for="(cmd, ci) in getCommandsByStepId(currentStep.id)"
            :key="cmd.id"
            class="dc-row"
          >
            <div class="dc-idx">{{ ci + 1 }}</div>
            <div class="dc-main">
              <div class="dc-text">「{{ cmd.commandText }}」</div>
              <div class="dc-tags">
                <span
                  v-if="cmd.executorRoleId"
                  class="dc-tag role"
                  :style="{ borderColor: getRoleColor(cmd.executorRoleId), color: getRoleColor(cmd.executorRoleId) }"
                >
                  <Users class="w-3 h-3" />
                  {{ getRoleName(cmd.executorRoleId) }}
                </span>
                <span v-else class="dc-tag unassigned">未指派执行人</span>
                <span class="dc-tag beat">
                  <Clock class="w-3 h-3" />
                  {{ formatBeat(cmd) }}
                </span>
                <span
                  v-for="(wc, wi) in cmd.waitConditions"
                  :key="wi"
                  class="dc-tag wait"
                >
                  等待：{{ wc.description || (wc.type === 'previous-finish' ? '前序完成' : (wc.value || wc.type)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flow-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  box-sizing: border-box;
  background: #f5f0e6;
}

.flow-header {
  text-align: center;
  margin-bottom: 30px;
}

.flow-title {
  font-size: 22px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0 0 6px 0;
}

.flow-subtitle {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.flow-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 20px 0;
}

.flow-node-wrapper {
  display: flex;
  align-items: center;
}

.flow-node {
  width: 120px;
  background: #fff;
  border: 2px solid rgba(139, 69, 19, 0.15);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.flow-node:hover {
  border-color: rgba(95, 158, 160, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(95, 158, 160, 0.15);
}

.flow-node.active {
  border-color: #5F9EA0;
  background: linear-gradient(135deg, rgba(95, 158, 160, 0.1), rgba(95, 158, 160, 0.05));
  box-shadow: 0 0 0 4px rgba(95, 158, 160, 0.15), 0 8px 24px rgba(95, 158, 160, 0.2);
}

.flow-node.done {
  opacity: 0.6;
  background: #f5f5f5;
}

.node-number {
  width: 28px;
  height: 28px;
  margin: 0 auto 10px;
  background: rgba(139, 69, 19, 0.1);
  color: #8B4513;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.flow-node.active .node-number {
  background: #5F9EA0;
  color: #fff;
}

.node-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.08), rgba(212, 175, 55, 0.08));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B4513;
}

.flow-node.active .node-icon {
  background: linear-gradient(135deg, rgba(95, 158, 160, 0.15), rgba(95, 158, 160, 0.08));
  color: #3d6b6d;
}

.node-title {
  font-size: 13px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 4px;
}

.node-gesture {
  font-size: 11px;
  color: #999;
}

.flow-connector {
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4AF37;
  margin: 0 4px;
}

.flow-detail {
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-badge {
  background: #5F9EA0;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
}

.detail-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 12px 0;
}

.detail-route {
  font-size: 13px;
  color: #666;
  padding: 10px 14px;
  background: rgba(212, 175, 55, 0.08);
  border-radius: 8px;
}

.detail-route strong {
  color: #8B6914;
  margin-right: 8px;
}

.route-arrow {
  color: #D4AF37;
  margin: 0 6px;
  font-weight: 600;
}

.route-item {
  background: rgba(212, 175, 55, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  color: #8B6914;
  font-size: 12px;
}

.flow-node.diff-added {
  border-color: #27ae60 !important;
  border-width: 3px !important;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15);
  animation: flow-pulse-green 2s ease-in-out infinite;
}

.flow-node.diff-removed {
  border-color: #e74c3c !important;
  border-width: 3px !important;
  opacity: 0.7;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
  animation: flow-pulse-red 2s ease-in-out infinite;
}

.flow-node.diff-moved {
  border-color: #f39c12 !important;
  border-width: 3px !important;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.15);
  animation: flow-pulse-yellow 2s ease-in-out infinite;
}

@keyframes flow-pulse-green {
  0%, 100% { box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15); }
  50% { box-shadow: 0 0 0 5px rgba(39, 174, 96, 0.25); }
}

@keyframes flow-pulse-red {
  0%, 100% { box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15); }
  50% { box-shadow: 0 0 0 5px rgba(231, 76, 60, 0.25); }
}

@keyframes flow-pulse-yellow {
  0%, 100% { box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.15); }
  50% { box-shadow: 0 0 0 5px rgba(243, 156, 18, 0.25); }
}

.flow-node.diff-added .node-number {
  background: #27ae60 !important;
  color: white !important;
}

.flow-node.diff-removed .node-number {
  background: #e74c3c !important;
  color: white !important;
}

.flow-node.diff-moved .node-number {
  background: #f39c12 !important;
  color: white !important;
}

.flow-node .diff-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.flow-node.diff-added .diff-badge.diff-added {
  background: #27ae60;
}

.flow-node.diff-removed .diff-badge.diff-removed {
  background: #e74c3c;
}

.flow-node.diff-moved .diff-badge.diff-moved {
  background: #f39c12;
}

.changed-fields {
  margin-top: 6px;
  font-size: 10px;
  color: #888;
  padding: 2px 6px;
  background: rgba(243, 156, 18, 0.1);
  border-radius: 4px;
}

.ghost-node {
  background: repeating-linear-gradient(
    45deg,
    rgba(245, 245, 245, 0.5),
    rgba(245, 245, 245, 0.5) 4px,
    rgba(250, 250, 250, 0.7) 4px,
    rgba(250, 250, 250, 0.7) 8px
  ) !important;
  border: 2px dashed #bbb !important;
  opacity: 0.5;
}

.ghost-node .node-number,
.ghost-number {
  background: rgba(231, 76, 60, 0.4) !important;
  color: white !important;
}

.node-executors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 6px;
  background: rgba(139, 69, 19, 0.04);
  border-radius: 6px;
  color: #888;
  font-size: 10px;
}

.executor-dots {
  display: flex;
  gap: 3px;
}

.executor-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.cmd-count {
  font-weight: 600;
  background: rgba(95, 158, 160, 0.15);
  color: #5F9EA0;
  padding: 0 5px;
  border-radius: 8px;
  font-size: 10px;
}

.detail-commands {
  margin-top: 14px;
  background: rgba(95, 158, 160, 0.04);
  border: 1px solid rgba(95, 158, 160, 0.15);
  border-radius: 10px;
  padding: 12px 14px;
}

.dc-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #5F9EA0;
}

.dc-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dc-row {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid rgba(95, 158, 160, 0.1);
}

.dc-idx {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  background: #5F9EA0;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.dc-main {
  flex: 1;
  min-width: 0;
}

.dc-text {
  font-size: 13px;
  color: #2C2C2C;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 5px;
}

.dc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.dc-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
}

.dc-tag.role {
  background: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  border-left-width: 3px;
}

.dc-tag.unassigned {
  background: #f5f5f5;
  color: #999;
  border-color: #ddd;
}

.dc-tag.beat {
  background: rgba(139, 69, 19, 0.08);
  border-color: rgba(139, 69, 19, 0.15);
  color: #8B4513;
}

.dc-tag.wait {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.25);
  color: #8B6914;
}
</style>
