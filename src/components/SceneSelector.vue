<script setup lang="ts">
import { ref } from 'vue'
import { Crown, Coffee, Handshake, Flame, ChevronDown } from 'lucide-vue-next'
import type { CeremonyScene } from '@/types'
import { ceremonyTemplates } from '@/data/templates'

const props = defineProps<{
  currentScene: CeremonyScene
}>()

const emit = defineEmits<{
  (e: 'change', scene: CeremonyScene): void
}>()

const isOpen = ref(false)

const iconMap: Record<string, any> = {
  handshake: Handshake,
  coffee: Coffee,
  crown: Crown,
  flame: Flame,
}

function selectScene(scene: CeremonyScene) {
  emit('change', scene)
  isOpen.value = false
}

function getCurrentTemplate() {
  return ceremonyTemplates.find(t => t.scene === props.currentScene)
}
</script>

<template>
  <div class="scene-selector">
    <button
      class="scene-trigger"
      @click="isOpen = !isOpen"
    >
      <component :is="iconMap[getCurrentTemplate()?.icon || 'handshake']" class="w-5 h-5" />
      <span class="scene-name">{{ getCurrentTemplate()?.name }}</span>
      <ChevronDown class="w-4 h-4 ml-1 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>
    
    <div v-if="isOpen" class="scene-dropdown">
      <div
        v-for="template in ceremonyTemplates"
        :key="template.scene"
        class="scene-item"
        :class="{ active: template.scene === currentScene }"
        @click="selectScene(template.scene as CeremonyScene)"
      >
        <div class="scene-icon">
          <component :is="iconMap[template.icon]" class="w-5 h-5" />
        </div>
        <div class="scene-info">
          <div class="scene-title">{{ template.name }}</div>
          <div class="scene-desc">{{ template.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene-selector {
  position: relative;
}

.scene-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(139, 69, 19, 0.08);
  border: 1px solid rgba(139, 69, 19, 0.2);
  border-radius: 8px;
  color: #5c3317;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-trigger:hover {
  background: rgba(139, 69, 19, 0.12);
  border-color: rgba(139, 69, 19, 0.3);
}

.scene-name {
  font-size: 15px;
}

.scene-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 320px;
  background: #fdfaf4;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(44, 44, 44, 0.12);
  z-index: 100;
  overflow: hidden;
}

.scene-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
}

.scene-item:last-child {
  border-bottom: none;
}

.scene-item:hover {
  background: rgba(139, 69, 19, 0.06);
}

.scene-item.active {
  background: rgba(95, 158, 160, 0.1);
}

.scene-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 10px;
  color: #8B4513;
  flex-shrink: 0;
}

.scene-info {
  flex: 1;
  min-width: 0;
}

.scene-title {
  font-size: 14px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 2px;
}

.scene-desc {
  font-size: 12px;
  color: #6B6B6B;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
