<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, FolderOpen, Trash2, X, FileText, Clock } from 'lucide-vue-next'
import type { CeremonyScheme } from '@/types'
import { formatDate } from '@/utils/id'

defineProps<{
  schemes: CeremonyScheme[]
  currentSchemeName: string
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'load', scheme: CeremonyScheme): void
  (e: 'delete', schemeId: string): void
  (e: 'close'): void
}>()

const isOpen = ref(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  emit('close')
}

function handleSave() {
  emit('save')
}

function handleLoad(scheme: CeremonyScheme) {
  emit('load', scheme)
  close()
}

function handleDelete(e: Event, schemeId: string) {
  e.stopPropagation()
  if (confirm('确定要删除这个方案吗？')) {
    emit('delete', schemeId)
  }
}

defineExpose({ open, close })
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="scheme-manager-overlay" @click.self="close">
      <div class="scheme-manager">
        <div class="sm-header">
          <h3 class="sm-title">方案管理</h3>
          <button class="sm-close" @click="close">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="sm-actions">
          <button class="btn-primary" @click="handleSave">
            <Save class="w-4 h-4" />
            保存当前方案
          </button>
          <div class="current-name">{{ currentSchemeName }}</div>
        </div>
        
        <div class="sm-divider"></div>
        
        <div class="sm-list-header">已保存方案</div>
        
        <div class="sm-list">
          <div v-if="schemes.length === 0" class="sm-empty">
            <FileText class="w-10 h-10 empty-icon" />
            <p>暂无保存的方案</p>
            <span>保存方案后，可以随时加载继续编辑</span>
          </div>
          
          <div
            v-for="scheme in schemes"
            :key="scheme.id"
            class="scheme-card"
            @click="handleLoad(scheme)"
          >
            <div class="scheme-icon">
              <FileText class="w-5 h-5" />
            </div>
            <div class="scheme-info">
              <div class="scheme-name">{{ scheme.name }}</div>
              <div class="scheme-meta">
                <span class="scheme-scene">{{ scheme.scene === 'welcome' ? '迎宾礼' : scheme.scene === 'tea' ? '敬茶礼' : scheme.scene === 'capping' ? '冠礼' : '祭礼' }}</span>
                <span class="scheme-time">
                  <Clock class="w-3 h-3" />
                  {{ formatDate(scheme.updatedAt) }}
                </span>
              </div>
            </div>
            <button class="scheme-delete" @click="handleDelete($event, scheme.id)">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.scheme-manager-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.scheme-manager {
  width: 480px;
  max-height: 80vh;
  background: #fdfaf4;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.sm-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
}

.sm-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sm-close:hover {
  background: rgba(139, 69, 19, 0.08);
  color: #5c3317;
}

.sm-actions {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #6d3610, #8B4513);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.current-name {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.sm-divider {
  height: 1px;
  background: rgba(139, 69, 19, 0.08);
  margin: 0 24px;
}

.sm-list-header {
  padding: 12px 24px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #8B4513;
}

.sm-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.sm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 12px;
}

.sm-empty p {
  font-size: 14px;
  color: #888;
  margin: 0 0 4px 0;
}

.sm-empty span {
  font-size: 12px;
  color: #aaa;
}

.scheme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scheme-card:hover {
  border-color: rgba(95, 158, 160, 0.4);
  box-shadow: 0 4px 12px rgba(95, 158, 160, 0.1);
  transform: translateX(4px);
}

.scheme-icon {
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

.scheme-info {
  flex: 1;
  min-width: 0;
}

.scheme-name {
  font-size: 14px;
  font-weight: 500;
  color: #2C2C2C;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scheme-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #999;
}

.scheme-scene {
  background: rgba(95, 158, 160, 0.1);
  color: #5F9EA0;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.scheme-time {
  display: flex;
  align-items: center;
  gap: 3px;
}

.scheme-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.scheme-delete:hover {
  background: rgba(255, 80, 80, 0.1);
  color: #e74c3c;
}
</style>
