<script setup lang="ts">
import { ref, computed } from 'vue'
import { Crown, User, Users, Table, Minus, Square, SquareDashed, Coffee, Wine, Droplets, Apple, Flame, Lamp, Scroll, Flower2 } from 'lucide-vue-next'
import type { ElementCategory, MaterialItem } from '@/types'
import { materialItems } from '@/data/templates'

const emit = defineEmits<{
  (e: 'drag-start', item: MaterialItem): void
  (e: 'drag-end'): void
}>()

const activeCategory = ref<ElementCategory | 'all'>('all')

const categories: { key: ElementCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'seat', label: '席位' },
  { key: 'table', label: '案几' },
  { key: 'mat', label: '席垫' },
  { key: 'vessel', label: '礼器' },
  { key: 'decor', label: '陈设' },
]

const iconMap: Record<string, any> = {
  crown: Crown,
  user: User,
  'user-circle': User,
  users: Users,
  table: Table,
  minus: Minus,
  square: Square,
  'square-dashed': SquareDashed,
  coffee: Coffee,
  wine: Wine,
  droplets: Droplets,
  apple: Apple,
  flame: Flame,
  lamp: Lamp,
  scroll: Scroll,
  flower: Flower2,
}

const filteredItems = computed(() => {
  if (activeCategory.value === 'all') {
    return materialItems
  }
  return materialItems.filter(item => item.category === activeCategory.value)
})

function handleDragStart(e: DragEvent, item: MaterialItem) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify(item))
  }
  emit('drag-start', item)
}

function handleDragEnd() {
  emit('drag-end')
}
</script>

<template>
  <div class="material-library">
    <div class="library-header">
      <h3 class="library-title">器物素材库</h3>
    </div>
    
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="category-tab"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>
    
    <div class="material-grid">
      <div
        v-for="item in filteredItems"
        :key="item.type"
        class="material-card"
        draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd"
      >
        <div class="material-icon">
          <component :is="iconMap[item.icon]" class="w-6 h-6" />
        </div>
        <div class="material-name">{{ item.name }}</div>
      </div>
    </div>
    
    <div class="library-hint">
      拖拽素材到画布上摆放
    </div>
  </div>
</template>

<style scoped>
.material-library {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fdfaf4;
  border-right: 1px solid rgba(139, 69, 19, 0.1);
}

.library-header {
  padding: 16px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.library-title {
  font-size: 15px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
}

.category-tab {
  padding: 5px 10px;
  font-size: 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #6B6B6B;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab:hover {
  background: rgba(139, 69, 19, 0.06);
  color: #5c3317;
}

.category-tab.active {
  background: rgba(95, 158, 160, 0.12);
  color: #3d6b6d;
  border-color: rgba(95, 158, 160, 0.3);
}

.material-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px;
  align-content: start;
}

.material-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  background: #fffef9;
  border: 1px solid rgba(139, 69, 19, 0.12);
  border-radius: 10px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.material-card:hover {
  background: #fff;
  border-color: rgba(95, 158, 160, 0.4);
  box-shadow: 0 4px 12px rgba(95, 158, 160, 0.15);
  transform: translateY(-2px);
}

.material-card:active {
  cursor: grabbing;
}

.material-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.08), rgba(95, 158, 160, 0.08));
  border-radius: 10px;
  color: #8B4513;
}

.material-name {
  font-size: 12px;
  color: #4a4a4a;
  text-align: center;
}

.library-hint {
  padding: 10px 16px;
  font-size: 11px;
  color: #999;
  text-align: center;
  border-top: 1px solid rgba(139, 69, 19, 0.06);
  background: rgba(139, 69, 19, 0.02);
}
</style>
