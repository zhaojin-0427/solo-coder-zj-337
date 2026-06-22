<script setup lang="ts">
import { ref, computed } from 'vue'
import { Save, FolderOpen, Trash2, X, FileText, Clock, History, ArrowLeftRight, RotateCcw, Check, ArrowLeft, Camera } from 'lucide-vue-next'
import type { CeremonyScheme, SchemeSnapshot } from '@/types'
import { formatDate } from '@/utils/id'

const props = defineProps<{
  schemes: CeremonyScheme[]
  currentSchemeName: string
  loadSnapshotsFn?: (schemeId: string) => SchemeSnapshot[]
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'load', scheme: CeremonyScheme): void
  (e: 'delete', schemeId: string): void
  (e: 'close'): void
  (e: 'compare', schemeA: CeremonyScheme, schemeB: CeremonyScheme): void
  (e: 'restore-snapshot', snapshot: SchemeSnapshot): void
  (e: 'delete-snapshot', snapshotId: string): void
}>()

const isOpen = ref(false)
const viewMode = ref<'list' | 'compare-select' | 'snapshots'>('list')
const compareSelectMode = ref<'first' | 'second'>('first')
const firstCompareScheme = ref<CeremonyScheme | null>(null)
const activeSchemeId = ref<string | null>(null)
const schemeSnapshots = ref<SchemeSnapshot[]>([])

function open() {
  isOpen.value = true
  viewMode.value = 'list'
  compareSelectMode.value = 'first'
  firstCompareScheme.value = null
}

function close() {
  isOpen.value = false
  viewMode.value = 'list'
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
  if (confirm('确定要删除这个方案吗？该方案的所有历史快照也将被删除。')) {
    emit('delete', schemeId)
  }
}

function enterCompareMode() {
  if (props.schemes.length < 2) {
    alert('至少需要两个已保存的方案才能进行对比')
    return
  }
  viewMode.value = 'compare-select'
  compareSelectMode.value = 'first'
  firstCompareScheme.value = null
}

function selectFirstCompare(scheme: CeremonyScheme) {
  firstCompareScheme.value = scheme
  compareSelectMode.value = 'second'
}

function selectSecondCompare(scheme: CeremonyScheme) {
  if (!firstCompareScheme.value) return
  if (scheme.scene !== firstCompareScheme.value.scene) {
    alert('请选择同一场景的方案进行对比')
    return
  }
  emit('compare', firstCompareScheme.value, scheme)
  close()
}

function cancelCompareSelection() {
  viewMode.value = 'list'
  compareSelectMode.value = 'first'
  firstCompareScheme.value = null
}

function viewSnapshots(scheme: CeremonyScheme, e: Event) {
  e.stopPropagation()
  activeSchemeId.value = scheme.id
  if (props.loadSnapshotsFn) {
    schemeSnapshots.value = props.loadSnapshotsFn(scheme.id)
  }
  viewMode.value = 'snapshots'
}

function backToList() {
  viewMode.value = 'list'
  activeSchemeId.value = null
  schemeSnapshots.value = []
}

function restoreSnapshot(snapshot: SchemeSnapshot) {
  if (confirm('确定要恢复到此快照吗？当前未保存的修改将丢失。')) {
    emit('restore-snapshot', snapshot)
    close()
  }
}

function handleDeleteSnapshot(e: Event, snapshotId: string) {
  e.stopPropagation()
  if (confirm('确定要删除此快照吗？')) {
    emit('delete-snapshot', snapshotId)
    if (activeSchemeId.value && props.loadSnapshotsFn) {
      schemeSnapshots.value = props.loadSnapshotsFn(activeSchemeId.value)
    }
  }
}

const activeScheme = computed(() => {
  return props.schemes.find(s => s.id === activeSchemeId.value)
})

const comparableSchemes = computed(() => {
  if (!firstCompareScheme.value) return props.schemes
  return props.schemes.filter(s => s.scene === firstCompareScheme.value!.scene && s.id !== firstCompareScheme.value!.id)
})

function getSceneLabel(scene: string) {
  return scene === 'welcome' ? '迎宾礼' : scene === 'tea' ? '敬茶礼' : scene === 'capping' ? '冠礼' : '祭礼'
}

defineExpose({ open, close })
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="scheme-manager-overlay" @click.self="close">
      <div class="scheme-manager">
        <div class="sm-header">
          <div class="sm-header-left">
            <template v-if="viewMode === 'compare-select'">
              <button class="back-btn" @click="cancelCompareSelection">
                <ArrowLeft class="w-4 h-4" />
              </button>
              <h3 class="sm-title">
                选择方案对比
                <span class="sm-subtitle">
                  {{ compareSelectMode === 'first' ? '（第一步：选择方案 A）' : `（第二步：选择方案 B，与「${firstCompareScheme?.name}」对比）` }}
                </span>
              </h3>
            </template>
            <template v-else-if="viewMode === 'snapshots'">
              <button class="back-btn" @click="backToList">
                <ArrowLeft class="w-4 h-4" />
              </button>
              <h3 class="sm-title">
                历史快照
                <span class="sm-subtitle">（{{ activeScheme?.name }}）</span>
              </h3>
            </template>
            <template v-else>
              <h3 class="sm-title">方案管理</h3>
            </template>
          </div>
          <button class="sm-close" @click="close">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <template v-if="viewMode === 'list'">
          <div class="sm-actions">
            <button class="btn-primary" @click="handleSave">
              <Save class="w-4 h-4" />
              保存当前方案
            </button>
            <button class="btn-secondary" @click="enterCompareMode" :disabled="schemes.length < 2">
              <ArrowLeftRight class="w-4 h-4" />
              方案对比
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
                  <span class="scheme-scene">{{ getSceneLabel(scheme.scene) }}</span>
                  <span class="scheme-time">
                    <Clock class="w-3 h-3" />
                    {{ formatDate(scheme.updatedAt) }}
                  </span>
                  <span class="scheme-elements">{{ scheme.elements.length }} 元素</span>
                </div>
              </div>
              <div class="scheme-actions">
                <button class="scheme-action-btn" title="查看历史快照" @click.stop="viewSnapshots(scheme, $event)">
                  <History class="w-4 h-4" />
                </button>
                <button class="scheme-delete" @click.stop="handleDelete($event, scheme.id)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="viewMode === 'compare-select'">
          <div class="sm-compare-hint">
            <div class="compare-step" :class="{ done: compareSelectMode === 'second', active: compareSelectMode === 'first' }">
              <div class="step-dot">1</div>
              <span>选择方案 A</span>
              <span v-if="compareSelectMode === 'second' && firstCompareScheme" class="step-selected">
                {{ firstCompareScheme.name }}
              </span>
            </div>
            <div class="step-arrow">→</div>
            <div class="compare-step" :class="{ active: compareSelectMode === 'second' }">
              <div class="step-dot">2</div>
              <span>选择方案 B</span>
            </div>
          </div>

          <div class="sm-divider"></div>

          <div class="sm-list-header">
            {{ compareSelectMode === 'first' ? '选择方案 A' : `选择与「${firstCompareScheme?.name}」对比的方案（同场景）` }}
          </div>

          <div class="sm-list">
            <div v-if="comparableSchemes.length === 0" class="sm-empty">
              <FileText class="w-10 h-10 empty-icon" />
              <p>没有可选择的方案</p>
            </div>

            <div
              v-for="scheme in comparableSchemes"
              :key="scheme.id"
              class="scheme-card selectable"
              @click="compareSelectMode === 'first' ? selectFirstCompare(scheme) : selectSecondCompare(scheme)"
            >
              <div class="scheme-icon">
                <FileText class="w-5 h-5" />
              </div>
              <div class="scheme-info">
                <div class="scheme-name">{{ scheme.name }}</div>
                <div class="scheme-meta">
                  <span class="scheme-scene">{{ getSceneLabel(scheme.scene) }}</span>
                  <span class="scheme-time">
                    <Clock class="w-3 h-3" />
                    {{ formatDate(scheme.updatedAt) }}
                  </span>
                  <span class="scheme-elements">{{ scheme.elements.length }} 元素</span>
                </div>
              </div>
              <div class="scheme-check">
                <Check v-if="compareSelectMode === 'second' && firstCompareScheme?.scene === scheme.scene" class="w-4 h-4 check-ok" />
                <X v-else-if="compareSelectMode === 'second'" class="w-4 h-4 check-no" />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="viewMode === 'snapshots'">
          <div class="sm-snapshots-info">
            <div class="snapshots-info-left">
              <Camera class="w-4 h-4" />
              <span>共 {{ schemeSnapshots.length }} 个历史快照（最多保留 50 个）</span>
            </div>
          </div>

          <div class="sm-divider"></div>

          <div class="sm-list-header">快照列表（新 → 旧）</div>

          <div class="sm-list">
            <div v-if="schemeSnapshots.length === 0" class="sm-empty">
              <History class="w-10 h-10 empty-icon" />
              <p>暂无历史快照</p>
              <span>每次保存方案时会自动创建一份快照</span>
            </div>

            <div
              v-for="(snapshot, index) in schemeSnapshots"
              :key="snapshot.id"
              class="snapshot-card"
            >
              <div class="snapshot-index">{{ index + 1 }}</div>
              <div class="snapshot-info">
                <div class="snapshot-name">{{ snapshot.name }}</div>
                <div class="snapshot-meta">
                  <span class="snapshot-time">
                    <Clock class="w-3 h-3" />
                    {{ formatDate(snapshot.timestamp) }}
                  </span>
                  <span class="snapshot-elements">{{ snapshot.elements.length }} 元素</span>
                </div>
              </div>
              <div class="snapshot-actions">
                <button class="snapshot-restore" @click="restoreSnapshot(snapshot)">
                  <RotateCcw class="w-4 h-4" />
                  恢复
                </button>
                <button class="snapshot-delete" @click.stop="handleDeleteSnapshot($event, snapshot.id)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>
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
  width: 520px;
  max-height: 85vh;
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

.sm-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 69, 19, 0.08);
  border: none;
  border-radius: 8px;
  color: #5c3317;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(139, 69, 19, 0.15);
}

.sm-title {
  font-size: 18px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.sm-subtitle {
  font-size: 13px;
  font-weight: 400;
  color: #888;
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
  flex-wrap: wrap;
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

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #fff;
  color: #5F9EA0;
  border: 1px solid rgba(95, 158, 160, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(95, 158, 160, 0.08);
  border-color: rgba(95, 158, 160, 0.5);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-name {
  font-size: 13px;
  color: #666;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.scheme-card.selectable:hover {
  background: rgba(95, 158, 160, 0.04);
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
  flex-wrap: wrap;
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

.scheme-elements {
  background: rgba(139, 69, 19, 0.08);
  color: #8B4513;
  padding: 1px 6px;
  border-radius: 4px;
}

.scheme-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.scheme-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.scheme-action-btn:hover {
  background: rgba(95, 158, 160, 0.1);
  color: #5F9EA0;
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

.scheme-check {
  flex-shrink: 0;
  width: 24px;
  display: flex;
  justify-content: center;
}

.check-ok {
  color: #27ae60;
}

.check-no {
  color: #ccc;
}

.sm-compare-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}

.compare-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #888;
  flex-wrap: wrap;
}

.compare-step.active {
  color: #5F9EA0;
  font-weight: 500;
}

.compare-step.done {
  color: #27ae60;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(139, 69, 19, 0.1);
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.compare-step.active .step-dot {
  background: #5F9EA0;
  color: white;
}

.compare-step.done .step-dot {
  background: #27ae60;
  color: white;
}

.step-selected {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
}

.step-arrow {
  color: #D4AF37;
  font-size: 18px;
  font-weight: 700;
}

.sm-snapshots-info {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.snapshots-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #8B4513;
}

.snapshot-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.08);
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.snapshot-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.08);
}

.snapshot-index {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.15);
  color: #8B6914;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.snapshot-info {
  flex: 1;
  min-width: 0;
}

.snapshot-name {
  font-size: 13px;
  font-weight: 500;
  color: #2C2C2C;
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snapshot-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #999;
}

.snapshot-time {
  display: flex;
  align-items: center;
  gap: 3px;
}

.snapshot-elements {
  background: rgba(139, 69, 19, 0.06);
  color: #8B4513;
  padding: 1px 6px;
  border-radius: 4px;
}

.snapshot-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.snapshot-restore {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(95, 158, 160, 0.1);
  color: #5F9EA0;
  border: 1px solid rgba(95, 158, 160, 0.2);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.snapshot-restore:hover {
  background: rgba(95, 158, 160, 0.2);
  border-color: rgba(95, 158, 160, 0.4);
}

.snapshot-delete {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.snapshot-delete:hover {
  background: rgba(255, 80, 80, 0.1);
  color: #e74c3c;
}
</style>
