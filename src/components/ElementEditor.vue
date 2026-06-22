<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Trash2, RotateCw, Move, Layers } from 'lucide-vue-next'
import type { CanvasElement } from '@/types'
import { materialItems } from '@/data/templates'

const props = defineProps<{
  element: CanvasElement | null
}>()

const emit = defineEmits<{
  (e: 'update', id: string, updates: Partial<CanvasElement>): void
  (e: 'delete', id: string): void
  (e: 'bring-to-front', id: string): void
}>()

const localLabel = ref('')

const elementTypeInfo = computed(() => {
  if (!props.element) return null
  return materialItems.find(m => m.type === props.element?.type)
})

watch(
  () => props.element,
  (newEl) => {
    if (newEl) {
      localLabel.value = newEl.label
    }
  },
  { immediate: true }
)

function handleLabelChange() {
  if (props.element) {
    emit('update', props.element.id, { label: localLabel.value })
  }
}

function handleRotation(deg: number) {
  if (props.element) {
    emit('update', props.element.id, { rotation: props.element.rotation + deg })
  }
}
</script>

<template>
  <div v-if="element" class="element-editor">
    <div class="editor-header">
      <h4 class="editor-title">元素属性</h4>
    </div>
    
    <div class="editor-body">
      <div class="editor-section">
        <div class="section-title">基本信息</div>
        <div class="info-row">
          <span class="info-label">类型</span>
          <span class="info-value">{{ elementTypeInfo?.name || element.type }}</span>
        </div>
        <div class="form-row">
          <label class="form-label">名称</label>
          <input
            v-model="localLabel"
            type="text"
            class="form-input"
            @blur="handleLabelChange"
            @keyup.enter="handleLabelChange"
          />
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-title">位置</div>
        <div class="position-grid">
          <div class="form-row">
            <label class="form-label">X</label>
            <input
              type="number"
              class="form-input small"
              :value="Math.round(element.x)"
              @change="(e) => emit('update', element.id, { x: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="form-row">
            <label class="form-label">Y</label>
            <input
              type="number"
              class="form-input small"
              :value="Math.round(element.y)"
              @change="(e) => emit('update', element.id, { y: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-title">尺寸</div>
        <div class="position-grid">
          <div class="form-row">
            <label class="form-label">宽</label>
            <input
              type="number"
              class="form-input small"
              :value="element.width"
              @change="(e) => emit('update', element.id, { width: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="form-row">
            <label class="form-label">高</label>
            <input
              type="number"
              class="form-input small"
              :value="element.height"
              @change="(e) => emit('update', element.id, { height: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
        </div>
      </div>
      
      <div class="editor-section">
        <div class="section-title">操作</div>
        <div class="action-buttons">
          <button class="action-btn" @click="handleRotation(-15)">
            <RotateCw class="w-4 h-4" style="transform: scaleX(-1)" />
            左旋
          </button>
          <button class="action-btn" @click="handleRotation(15)">
            <RotateCw class="w-4 h-4" />
            右旋
          </button>
          <button class="action-btn" @click="emit('bring-to-front', element.id)">
            <Layers class="w-4 h-4" />
            置顶
          </button>
        </div>
      </div>
      
      <button class="delete-btn" @click="emit('delete', element.id)">
        <Trash2 class="w-4 h-4" />
        删除元素
      </button>
    </div>
    
    <div class="editor-hint">
      <Move class="w-3 h-3" />
      拖拽移动 · 方向键微调 · Delete 删除
    </div>
  </div>
</template>

<style scoped>
.element-editor {
  background: #fff;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
}

.editor-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
}

.editor-title {
  font-size: 13px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
}

.editor-body {
  padding: 12px 16px;
}

.editor-section {
  margin-bottom: 14px;
}

.section-title {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-label {
  font-size: 12px;
  color: #888;
}

.info-value {
  font-size: 12px;
  color: #5c3317;
  font-weight: 500;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11px;
  color: #888;
}

.form-input {
  padding: 6px 10px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 12px;
  color: #333;
  background: #fdfaf4;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #5F9EA0;
}

.form-input.small {
  width: 100%;
}

.position-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 8px;
  background: #f5f0e6;
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 6px;
  font-size: 11px;
  color: #5c3317;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #ebe3d0;
}

.delete-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: rgba(231, 76, 60, 0.08);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #c0392b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.delete-btn:hover {
  background: rgba(231, 76, 60, 0.15);
}

.editor-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  font-size: 10px;
  color: #aaa;
  background: #faf7f0;
  border-top: 1px solid rgba(139, 69, 19, 0.06);
}
</style>
