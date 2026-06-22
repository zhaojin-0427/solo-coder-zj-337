<script setup lang="ts">
import { ArrowUp, ArrowDown, Play, Pause, RotateCcw, Users, Clock } from 'lucide-vue-next'
import type { CeremonyStep, CanvasElement, StepCommand, RehearsalRole } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  steps: CeremonyStep[]
  currentStepIndex: number
  isPlaying: boolean
  elements: CanvasElement[]
  stepCommands: StepCommand[]
  roles: RehearsalRole[]
}>()

const emit = defineEmits<{
  (e: 'step-change', index: number): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'toggle-play'): void
  (e: 'reset'): void
}>()

function getStepStatus(index: number, currentIndex: number): 'done' | 'current' | 'upcoming' {
  if (index < currentIndex) return 'done'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

function getElementLabel(id: string): string {
  const el = props.elements.find(e => e.id === id)
  return el?.label || id
}

function getRoleName(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.name || '未指派'
}

function getRoleColor(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.color || '#999'
}

function getCommandsByStepId(stepId: string): StepCommand[] {
  return props.stepCommands.filter(c => c.stepId === stepId)
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

const deliveryItemLabel = computed(() => {
  const step = props.steps[props.currentStepIndex]
  if (!step?.deliveryRoute) return ''
  return getElementLabel(step.deliveryRoute.item)
})

const totalCommandCount = computed(() => props.stepCommands.length)
</script>

<template>
  <div class="ceremony-steps">
    <div class="steps-header">
      <h3 class="steps-title">礼序步骤</h3>
      <div class="step-counter">
        {{ currentStepIndex + 1 }} / {{ steps.length }} · 口令 {{ totalCommandCount }}
      </div>
    </div>
    
    <div class="steps-controls">
      <button
        class="control-btn"
        :disabled="currentStepIndex === 0"
        @click="emit('prev')"
      >
        <ArrowUp class="w-4 h-4" />
      </button>
      <button
        class="control-btn play-btn"
        @click="emit('toggle-play')"
      >
        <Pause v-if="isPlaying" class="w-5 h-5" />
        <Play v-else class="w-5 h-5" />
      </button>
      <button
        class="control-btn"
        :disabled="currentStepIndex === steps.length - 1"
        @click="emit('next')"
      >
        <ArrowDown class="w-4 h-4" />
      </button>
      <button class="control-btn reset-btn" @click="emit('reset')">
        <RotateCcw class="w-4 h-4" />
      </button>
    </div>
    
    <div class="steps-list">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
        :class="getStepStatus(index, currentStepIndex)"
        @click="emit('step-change', index)"
      >
        <div class="step-number">
          <span class="number-badge">{{ step.order }}</span>
          <div class="step-line" v-if="index < steps.length - 1"></div>
        </div>
        
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div v-if="getStepStatus(index, currentStepIndex) === 'current'" class="step-details">
            <p class="step-desc">{{ step.description }}</p>
            <div class="step-meta">
              <div v-if="step.gesture" class="meta-item">
                <span class="meta-label">礼节</span>
                <span class="meta-value">{{ step.gesture }}</span>
              </div>
              <div v-if="step.direction" class="meta-item">
                <span class="meta-label">方向</span>
                <span class="meta-value">{{ step.direction }}</span>
              </div>
              <div v-if="step.duration" class="meta-item">
                <span class="meta-label">节拍</span>
                <span class="meta-value">{{ step.duration }}</span>
              </div>
            </div>
            <div v-if="step.deliveryRoute" class="delivery-route">
              <div class="route-label">器物递送</div>
              <div class="route-path">
                <span class="route-from">{{ getElementLabel(step.deliveryRoute.from) }}</span>
                <span class="route-arrow">→</span>
                <span class="route-item">{{ getElementLabel(step.deliveryRoute.item) }}</span>
                <span class="route-arrow">→</span>
                <span class="route-to">{{ getElementLabel(step.deliveryRoute.to) }}</span>
              </div>
            </div>
            <div v-if="getCommandsByStepId(step.id).length > 0" class="step-commands">
              <div class="commands-header">
                <span class="commands-title">口令清单</span>
                <span class="commands-count">{{ getCommandsByStepId(step.id).length }} 条</span>
              </div>
              <div class="commands-list">
                <div
                  v-for="cmd in getCommandsByStepId(step.id)"
                  :key="cmd.id"
                  class="command-card"
                >
                  <div class="cmd-top">
                    <div
                      v-if="cmd.executorRoleId"
                      class="cmd-role"
                      :style="{ borderColor: getRoleColor(cmd.executorRoleId), color: getRoleColor(cmd.executorRoleId) }"
                    >
                      <Users class="w-3 h-3" />
                      {{ getRoleName(cmd.executorRoleId) }}
                    </div>
                    <div v-else class="cmd-role unassigned">
                      <span>未指派</span>
                    </div>
                    <div class="cmd-beat">
                      <Clock class="w-3 h-3" />
                      {{ formatBeat(cmd) }}
                    </div>
                  </div>
                  <div class="cmd-text">「{{ cmd.commandText }}」</div>
                  <div v-if="cmd.waitConditions.length > 0" class="cmd-waits">
                    <span
                      v-for="(wc, wi) in cmd.waitConditions"
                      :key="wi"
                      class="wait-chip"
                    >
                      等待：{{ wc.description || (wc.type === 'previous-finish' ? '前序完成' : (wc.type === 'countdown' ? (wc.value ? wc.value + '拍' : '等待') : (wc.value || wc.type))) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ceremony-steps {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fdfaf4;
  border-left: 1px solid rgba(139, 69, 19, 0.1);
}

.steps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.steps-title {
  font-size: 15px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
}

.step-counter {
  font-size: 12px;
  color: #8B4513;
  background: rgba(139, 69, 19, 0.08);
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.steps-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 8px;
  color: #5c3317;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(95, 158, 160, 0.08);
  border-color: rgba(95, 158, 160, 0.3);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.play-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: #fff;
  border: none;
}

.play-btn:hover {
  background: linear-gradient(135deg, #6d3610, #8B4513);
}

.reset-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
}

.steps-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.step-item:hover {
  background: rgba(139, 69, 19, 0.04);
}

.step-item.done .step-title {
  color: #888;
}

.step-item.current {
  background: rgba(95, 158, 160, 0.06);
}

.step-number {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.number-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e0d0;
  color: #8B4513;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.step-item.done .number-badge {
  background: #d0d0d0;
  color: #888;
}

.step-item.current .number-badge {
  background: #5F9EA0;
  color: #fff;
  box-shadow: 0 2px 8px rgba(95, 158, 160, 0.4);
}

.step-line {
  flex: 1;
  width: 2px;
  min-height: 20px;
  background: #e8e0d0;
  margin-top: 4px;
}

.step-item.done .step-line {
  background: #d0d0d0;
}

.step-content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.step-title {
  font-size: 13px;
  font-weight: 500;
  color: #2C2C2C;
  transition: color 0.2s ease;
}

.step-details {
  margin-top: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.step-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(139, 69, 19, 0.04);
  padding: 6px 10px;
  border-radius: 6px;
}

.meta-label {
  font-size: 10px;
  color: #999;
}

.meta-value {
  font-size: 12px;
  color: #5c3317;
  font-weight: 500;
}

.delivery-route {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 8px 10px;
}

.route-label {
  font-size: 11px;
  color: #9a7b28;
  margin-bottom: 4px;
  font-weight: 500;
}

.route-path {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

.route-from,
.route-to {
  color: #5c3317;
  font-weight: 500;
}

.route-arrow {
  color: #D4AF37;
  font-weight: 600;
}

.route-item {
  background: rgba(212, 175, 55, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #8B6914;
}

.step-commands {
  margin-top: 10px;
  background: rgba(95, 158, 160, 0.04);
  border: 1px solid rgba(95, 158, 160, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
}

.commands-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.commands-title {
  font-size: 11px;
  font-weight: 600;
  color: #5F9EA0;
}

.commands-count {
  font-size: 10px;
  color: #999;
  background: rgba(95, 158, 160, 0.1);
  padding: 1px 6px;
  border-radius: 8px;
}

.commands-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.command-card {
  background: #fff;
  border-radius: 6px;
  padding: 6px 8px;
  border: 1px solid rgba(95, 158, 160, 0.12);
}

.cmd-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.cmd-role {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-left: 2px solid;
  background: rgba(255, 255, 255, 0.8);
}

.cmd-role.unassigned {
  color: #999;
  border-left-color: #ccc;
}

.cmd-beat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #888;
  background: rgba(139, 69, 19, 0.05);
  padding: 1px 6px;
  border-radius: 8px;
}

.cmd-text {
  font-size: 11px;
  color: #333;
  line-height: 1.5;
  font-weight: 500;
}

.cmd-waits {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.wait-chip {
  font-size: 9px;
  color: #8B6914;
  background: rgba(212, 175, 55, 0.1);
  padding: 1px 6px;
  border-radius: 8px;
}
</style>
