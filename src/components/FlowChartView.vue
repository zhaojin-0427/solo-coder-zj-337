<script setup lang="ts">
import { ArrowRight, User, Droplets, Coffee, Crown, Flame } from 'lucide-vue-next'
import type { CeremonyStep } from '@/types'

defineProps<{
  steps: CeremonyStep[]
  currentStepIndex: number
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
</script>

<template>
  <div class="flow-chart">
    <div class="flow-header">
      <h3 class="flow-title">礼序流程图</h3>
      <p class="flow-subtitle">按顺序执行下列仪节</p>
    </div>
    
    <div class="flow-container">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="flow-node-wrapper"
      >
        <div
          class="flow-node"
          :class="{ active: index === currentStepIndex, done: index < currentStepIndex }"
          @click="emit('step-change', index)"
        >
          <div class="node-number">{{ step.order }}</div>
          <div class="node-icon">
            <component :is="getStepIcon(step)" class="w-5 h-5" />
          </div>
          <div class="node-title">{{ step.title }}</div>
          <div class="node-gesture">{{ step.gesture }}</div>
        </div>
        
        <div v-if="index < steps.length - 1" class="flow-connector">
          <ArrowRight class="w-5 h-5" />
        </div>
      </div>
    </div>
    
    <div v-if="steps[currentStepIndex]" class="flow-detail">
      <div class="detail-header">
        <span class="detail-badge">第 {{ currentStepIndex + 1 }} 步</span>
        <span class="detail-title">{{ steps[currentStepIndex].title }}</span>
      </div>
      <p class="detail-desc">{{ steps[currentStepIndex].description }}</p>
      <div v-if="steps[currentStepIndex].deliveryRoute" class="detail-route">
        <strong>器物递送：</strong>
        <span>{{ steps[currentStepIndex].deliveryRoute.from }}</span>
        <span class="route-arrow">→</span>
        <span class="route-item">{{ steps[currentStepIndex].deliveryRoute.item }}</span>
        <span class="route-arrow">→</span>
        <span>{{ steps[currentStepIndex].deliveryRoute.to }}</span>
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
</style>
