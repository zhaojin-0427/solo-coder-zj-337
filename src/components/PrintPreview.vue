<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Printer, Download, ZoomIn, ZoomOut } from 'lucide-vue-next'
import type { CeremonyStep, CeremonyTemplate } from '@/types'

const props = defineProps<{
  isOpen: boolean
  template: CeremonyTemplate | undefined
  steps: CeremonyStep[]
  schemeName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const zoom = ref(1)

const formattedDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
})

function close() {
  emit('close')
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

function handlePrint() {
  window.print()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="print-preview-overlay">
      <div class="print-toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn" @click="close">
            <X class="w-5 h-5" />
            关闭
          </button>
        </div>
        <div class="toolbar-center">
          <span class="toolbar-title">仪程卡预览</span>
        </div>
        <div class="toolbar-right">
          <button class="toolbar-btn" @click="zoomOut">
            <ZoomOut class="w-4 h-4" />
          </button>
          <span class="zoom-text">{{ Math.round(zoom * 100) }}%</span>
          <button class="toolbar-btn" @click="zoomIn">
            <ZoomIn class="w-4 h-4" />
          </button>
          <button class="toolbar-btn primary" @click="handlePrint">
            <Printer class="w-4 h-4" />
            打印
          </button>
        </div>
      </div>
      
      <div class="print-container">
        <div class="print-card" :style="{ transform: `scale(${zoom})` }">
          <div class="card-header">
            <div class="header-decoration left"></div>
            <div class="header-title">
              <div class="title-chinese">{{ template?.name || '古礼仪程' }}</div>
              <div class="title-english">Ceremony Program</div>
            </div>
            <div class="header-decoration right"></div>
          </div>
          
          <div class="card-subtitle">
            <span class="scheme-name">{{ schemeName }}</span>
          </div>
          
          <div class="card-divider"></div>
          
          <div class="card-steps">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="card-step"
            >
              <div class="step-order">
                <span class="order-number">{{ String(step.order).padStart(2, '0') }}</span>
              </div>
              <div class="step-info">
                <div class="step-name">{{ step.title }}</div>
                <div class="step-desc">{{ step.description }}</div>
                <div class="step-tags">
                  <span v-if="step.gesture" class="tag">{{ step.gesture }}</span>
                  <span v-if="step.direction" class="tag">{{ step.direction }}</span>
                  <span v-if="step.duration" class="tag">{{ step.duration }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="footer-left">{{ formattedDate }}</div>
            <div class="footer-right">古礼席位预演器</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .print-preview-overlay,
  .print-preview-overlay * {
    visibility: visible;
  }
  .print-toolbar {
    display: none !important;
  }
  .print-container {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    padding: 0 !important;
  }
  .print-card {
    transform: scale(1) !important;
    box-shadow: none !important;
    margin: 0 auto !important;
  }
}
</style>

<style scoped>
.print-preview-overlay {
  position: fixed;
  inset: 0;
  background: #333;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.print-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #2C2C2C;
  border-bottom: 1px solid #444;
  color: #fff;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 500;
  color: #ddd;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #ddd;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toolbar-btn.primary {
  background: #8B4513;
  border-color: #8B4513;
  color: #fff;
}

.toolbar-btn.primary:hover {
  background: #A0522D;
}

.zoom-text {
  font-size: 12px;
  color: #999;
  min-width: 48px;
  text-align: center;
}

.print-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.print-card {
  width: 640px;
  min-height: 900px;
  background: #fdfaf4;
  border-radius: 8px;
  padding: 50px 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transform-origin: top center;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.header-decoration {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8B4513, transparent);
}

.header-decoration.left {
  background: linear-gradient(90deg, transparent, #8B4513);
}

.header-decoration.right {
  background: linear-gradient(90deg, #8B4513, transparent);
}

.header-title {
  text-align: center;
}

.title-chinese {
  font-size: 36px;
  font-weight: 700;
  color: #8B4513;
  letter-spacing: 8px;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
}

.title-english {
  font-size: 11px;
  color: #999;
  letter-spacing: 4px;
  margin-top: 4px;
}

.card-subtitle {
  text-align: center;
  margin-bottom: 30px;
}

.scheme-name {
  font-size: 15px;
  color: #666;
  letter-spacing: 2px;
}

.card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.3), transparent);
  margin-bottom: 35px;
}

.card-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-step {
  display: flex;
  gap: 20px;
}

.step-order {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 69, 19, 0.08);
  border: 2px solid rgba(139, 69, 19, 0.2);
  border-radius: 50%;
}

.order-number {
  font-size: 20px;
  font-weight: 600;
  color: #8B4513;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
}

.step-info {
  flex: 1;
  padding-top: 4px;
}

.step-name {
  font-size: 18px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 6px;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
}

.step-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 8px;
}

.step-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  color: #8B4513;
  background: rgba(139, 69, 19, 0.08);
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(139, 69, 19, 0.15);
}

.card-footer {
  position: absolute;
  bottom: 40px;
  left: 60px;
  right: 60px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #aaa;
}
</style>
