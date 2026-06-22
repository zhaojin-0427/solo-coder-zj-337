<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Grid, GitBranch, Save, FileDown, Printer, FolderOpen, Info, Users, MessageSquare } from 'lucide-vue-next'
import SceneSelector from '@/components/SceneSelector.vue'
import MaterialLibrary from '@/components/MaterialLibrary.vue'
import SeatingCanvas from '@/components/SeatingCanvas.vue'
import CeremonySteps from '@/components/CeremonySteps.vue'
import FlowChartView from '@/components/FlowChartView.vue'
import ElementEditor from '@/components/ElementEditor.vue'
import SchemeManager from '@/components/SchemeManager.vue'
import PrintPreview from '@/components/PrintPreview.vue'
import SchemeCompare from '@/components/SchemeCompare.vue'
import RoleManager from '@/components/RoleManager.vue'
import CommandEditor from '@/components/CommandEditor.vue'
import { useCeremony } from '@/composables/useCeremony'
import { exportElementAsImage } from '@/utils/export'
import type { CeremonyScene, CanvasElement, CeremonyScheme, SchemeSnapshot, PrintSettings, RehearsalRole, StepCommand, BeatType, BeatCondition } from '@/types'

const {
  currentScene,
  viewMode,
  elements,
  selectedElementId,
  currentStepIndex,
  schemeName,
  isPlaying,
  currentTemplate,
  steps,
  currentStep,
  selectedElement,
  currentSchemeId,
  isCompareMode,
  compareViewMode,
  compareResult,
  printSettings,
  roles,
  stepCommands,
  highlightedRoleId,
  setScene,
  setViewMode,
  setCompareViewMode,
  exitCompareMode,
  addElement,
  updateElement,
  deleteElement,
  selectElement,
  setStepIndex,
  nextStep,
  prevStep,
  bringToFront,
  togglePlay,
  saveCurrentScheme,
  loadScheme,
  deleteSavedScheme,
  getAllSchemes,
  getSchemeSnapshots,
  restoreSnapshot,
  deleteSnapshotById,
  startCompare,
  updatePrintSettings,
  initDefault,
  addRole,
  updateRole,
  deleteRole,
  reorderRole,
  bindElementToRole,
  addStepCommand,
  updateStepCommand,
  deleteStepCommand,
  addWaitCondition,
  updateWaitCondition,
  deleteWaitCondition,
  setHighlightedRole,
} = useCeremony()

const seatingCanvasRef = ref<InstanceType<typeof SeatingCanvas> | null>(null)
const schemeManagerRef = ref<InstanceType<typeof SchemeManager> | null>(null)
const showPrintPreview = ref(false)
const schemes = ref<CeremonyScheme[]>([])
const showInfo = ref(false)
const isExporting = ref(false)
const leftTab = ref<'materials' | 'roles'>('materials')
const rightTab = ref<'steps' | 'commands'>('steps')

const elementCount = computed(() => elements.value.length)
const roleCount = computed(() => roles.value.length)
const commandCount = computed(() => stepCommands.value.length)

function handleSceneChange(scene: CeremonyScene) {
  setScene(scene)
}

function handleAddElement(type: string, x: number, y: number) {
  addElement(type, x, y)
}

function handleUpdateElement(id: string, updates: Partial<CanvasElement>) {
  updateElement(id, updates)
}

function handleDeleteElement(id: string) {
  deleteElement(id)
}

function handleSelectElement(id: string | null) {
  selectElement(id)
}

function handleStepChange(index: number) {
  setStepIndex(index)
}

function handleReset() {
  setStepIndex(0)
}

function handleOpenSchemes() {
  schemes.value = getAllSchemes()
  schemeManagerRef.value?.open()
}

function handleSaveScheme() {
  saveCurrentScheme()
  schemes.value = getAllSchemes()
}

function handleLoadScheme(scheme: CeremonyScheme) {
  loadScheme(scheme)
}

function handleDeleteScheme(schemeId: string) {
  deleteSavedScheme(schemeId)
  schemes.value = getAllSchemes()
}

async function handleExportImage() {
  if (isExporting.value) return
  isExporting.value = true
  
  try {
    const canvasEl = seatingCanvasRef.value?.getCanvasElement()
    if (canvasEl) {
      const filename = `${schemeName.value || '席位示意图'}_${Date.now()}.png`
      await exportElementAsImage(canvasEl, filename)
    } else {
      alert('无法获取画布元素')
    }
  } finally {
    isExporting.value = false
  }
}

function handlePrint() {
  showPrintPreview.value = true
}

function handleCompareSchemes(schemeA: CeremonyScheme, schemeB: CeremonyScheme) {
  const success = startCompare(schemeA, schemeB)
  if (!success) {
    alert('只能对比同场景的方案')
  }
  schemeManagerRef.value?.close()
}

function handleRestoreSnapshot(snapshot: SchemeSnapshot) {
  restoreSnapshot(snapshot.id)
  schemeManagerRef.value?.close()
}

function handleDeleteSnapshot(snapshotId: string) {
  deleteSnapshotById(snapshotId)
}

function handleUpdatePrintSettings(settings: PrintSettings) {
  updatePrintSettings(settings)
}

function handleAddRole(name: string, description?: string) {
  addRole(name, description)
}

function handleUpdateRole(roleId: string, updates: Partial<RehearsalRole>) {
  updateRole(roleId, updates)
}

function handleDeleteRole(roleId: string) {
  deleteRole(roleId)
}

function handleReorderRole(roleId: string, newOrder: number) {
  reorderRole(roleId, newOrder)
}

function handleHighlightRole(roleId: string | null) {
  setHighlightedRole(roleId)
}

function handleBindElementToRole(elementId: string, roleId: string) {
  bindElementToRole(elementId, roleId)
}

function handleAddStepCommand(stepId: string, commandText: string, executorRoleId: string, beatType: BeatType) {
  addStepCommand(stepId, commandText, executorRoleId, beatType)
}

function handleUpdateStepCommand(commandId: string, updates: Partial<StepCommand>) {
  updateStepCommand(commandId, updates)
}

function handleDeleteStepCommand(commandId: string) {
  deleteStepCommand(commandId)
}

function handleAddWaitCondition(commandId: string, condition: BeatCondition) {
  addWaitCondition(commandId, condition)
}

function handleUpdateWaitCondition(commandId: string, conditionIndex: number, updates: Partial<BeatCondition>) {
  updateWaitCondition(commandId, conditionIndex, updates)
}

function handleDeleteWaitCondition(commandId: string, conditionIndex: number) {
  deleteWaitCondition(commandId, conditionIndex)
}

onMounted(() => {
  initDefault()
})
</script>

<template>
  <div class="workspace">
    <header class="top-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">礼</span>
          <span class="logo-text">古礼席位预演器</span>
        </div>
        <SceneSelector
          :current-scene="currentScene"
          @change="handleSceneChange"
        />
      </div>
      
      <div class="header-center">
        <div class="view-tabs">
          <button
            class="view-tab"
            :class="{ active: viewMode === 'top' }"
            @click="setViewMode('top')"
          >
            <Grid class="w-4 h-4" />
            俯视图
          </button>
          <button
            class="view-tab"
            :class="{ active: viewMode === 'flow' }"
            @click="setViewMode('flow')"
          >
            <GitBranch class="w-4 h-4" />
            流程图
          </button>
        </div>
      </div>
      
      <div class="header-right">
        <button class="header-btn" @click="handleOpenSchemes">
          <FolderOpen class="w-4 h-4" />
          方案
        </button>
        <button class="header-btn primary" @click="handleSaveScheme">
          <Save class="w-4 h-4" />
          保存
        </button>
        <button class="header-btn" @click="handleExportImage">
          <FileDown class="w-4 h-4" />
          导出
        </button>
        <button class="header-btn" @click="handlePrint">
          <Printer class="w-4 h-4" />
          打印
        </button>
      </div>
    </header>
    
    <div class="main-content">
      <template v-if="isCompareMode">
        <SchemeCompare
          :compare-result="compareResult"
          :compare-view-mode="compareViewMode"
          @exit="exitCompareMode"
          @change-view="setCompareViewMode"
        />
      </template>
      <template v-else>
        <aside class="left-sidebar">
          <div class="sidebar-tabs">
            <button
              class="side-tab"
              :class="{ active: leftTab === 'materials' }"
              @click="leftTab = 'materials'"
            >
              <Grid class="w-4 h-4" />
              素材库
            </button>
            <button
              class="side-tab"
              :class="{ active: leftTab === 'roles' }"
              @click="leftTab = 'roles'"
            >
              <Users class="w-4 h-4" />
              角色
              <span v-if="roleCount > 0" class="tab-badge">{{ roleCount }}</span>
            </button>
          </div>
          <div class="sidebar-content">
            <MaterialLibrary v-show="leftTab === 'materials'" />
            <RoleManager
              v-show="leftTab === 'roles'"
              :roles="roles"
              :elements="elements"
              :highlighted-role-id="highlightedRoleId"
              @add-role="handleAddRole"
              @update-role="handleUpdateRole"
              @delete-role="handleDeleteRole"
              @reorder-role="handleReorderRole"
              @highlight-role="handleHighlightRole"
            />
          </div>
        </aside>
        
        <main class="canvas-area">
          <template v-if="viewMode === 'top'">
            <SeatingCanvas
              ref="seatingCanvasRef"
              :elements="elements"
              :selected-element-id="selectedElementId"
              :current-step="currentStep"
              :highlighted-role-id="highlightedRoleId"
              :roles="roles"
              @select="handleSelectElement"
              @update-element="handleUpdateElement"
              @add-element="handleAddElement"
              @delete-element="handleDeleteElement"
              @bring-to-front="bringToFront"
            />
          </template>
          <template v-else>
            <FlowChartView
              :steps="steps"
              :current-step-index="currentStepIndex"
              :elements="elements"
              :step-commands="stepCommands"
              :roles="roles"
              @step-change="handleStepChange"
            />
          </template>
        </main>
        
        <aside class="right-sidebar">
          <div class="sidebar-tabs">
            <button
              class="side-tab"
              :class="{ active: rightTab === 'steps' }"
              @click="rightTab = 'steps'"
            >
              <GitBranch class="w-4 h-4" />
              礼序
            </button>
            <button
              class="side-tab"
              :class="{ active: rightTab === 'commands' }"
              @click="rightTab = 'commands'"
            >
              <MessageSquare class="w-4 h-4" />
              口令
              <span v-if="commandCount > 0" class="tab-badge">{{ commandCount }}</span>
            </button>
          </div>
          <div class="sidebar-content">
            <div v-show="rightTab === 'steps'" class="tab-panel">
              <CeremonySteps
                :steps="steps"
                :current-step-index="currentStepIndex"
                :is-playing="isPlaying"
                :elements="elements"
                :step-commands="stepCommands"
                :roles="roles"
                @step-change="handleStepChange"
                @prev="prevStep"
                @next="nextStep"
                @toggle-play="togglePlay"
                @reset="handleReset"
              />
              <ElementEditor
                v-if="selectedElement && viewMode === 'top'"
                :element="selectedElement"
                :roles="roles"
                @update="handleUpdateElement"
                @delete="handleDeleteElement"
                @bring-to-front="bringToFront"
                @bind-to-role="handleBindElementToRole"
              />
            </div>
            <CommandEditor
              v-show="rightTab === 'commands'"
              :steps="steps"
              :current-step-index="currentStepIndex"
              :step-commands="stepCommands"
              :roles="roles"
              @step-change="handleStepChange"
              @add-command="handleAddStepCommand"
              @update-command="handleUpdateStepCommand"
              @delete-command="handleDeleteStepCommand"
              @add-wait-condition="handleAddWaitCondition"
              @update-wait-condition="handleUpdateWaitCondition"
              @delete-wait-condition="handleDeleteWaitCondition"
            />
          </div>
        </aside>
      </template>
    </div>
    
    <footer class="status-bar">
      <div class="status-left">
        <span class="status-item">方案：{{ schemeName }}</span>
      </div>
      <div class="status-right">
        <span class="status-item">元素：{{ elementCount }} 个</span>
        <span class="status-item">角色：{{ roleCount }} 人</span>
        <span class="status-item">口令：{{ commandCount }} 条</span>
        <span class="status-item">步骤：{{ steps.length }} 步</span>
        <span class="status-item" @click="showInfo = !showInfo" style="cursor: pointer">
          <Info class="w-3 h-3" />
          帮助
        </span>
      </div>
    </footer>
    
    <div v-if="showInfo" class="info-toast">
      <p><strong>操作提示：</strong></p>
      <ul>
        <li>从左侧「素材库」拖拽元素到画布</li>
        <li>切换到「角色」Tab 管理排练角色，点眼睛图标高亮区域</li>
        <li>点击元素选中，拖拽移动位置；属性区可绑定角色</li>
        <li>方向键微调选中元素位置，Delete 删除选中元素</li>
        <li>右侧「礼序」Tab 查看步骤与口令信息</li>
        <li>切换「口令」Tab 编辑每步口令文本、执行人和起拍方式</li>
        <li>顶部切换俯视图/流程图视图</li>
        <li>「打印」可导出仪程卡、角色分工表和口令表</li>
      </ul>
    </div>
    
    <SchemeManager
      ref="schemeManagerRef"
      :schemes="schemes"
      :current-scheme-name="schemeName"
      :load-snapshots-fn="getSchemeSnapshots"
      @save="handleSaveScheme"
      @load="handleLoadScheme"
      @delete="handleDeleteScheme"
      @compare="handleCompareSchemes"
      @restore-snapshot="handleRestoreSnapshot"
      @delete-snapshot="handleDeleteSnapshot"
    />
    
    <PrintPreview
      :is-open="showPrintPreview"
      :template="currentTemplate"
      :steps="steps"
      :scheme-name="schemeName"
      :elements="elements"
      :default-settings="printSettings"
      :roles="roles"
      :step-commands="stepCommands"
      @close="showPrintPreview = false"
      @update-settings="handleUpdatePrintSettings"
    />
  </div>
</template>

<style scoped>
.workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f0eadd;
}

.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fdfaf4;
  border-bottom: 1px solid rgba(139, 69, 19, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: #fff;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  letter-spacing: 2px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.view-tabs {
  display: flex;
  background: #f0eadd;
  border-radius: 10px;
  padding: 4px;
}

.view-tab {
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

.view-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.view-tab.active {
  background: #fff;
  color: #5F9EA0;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 8px;
  font-size: 13px;
  color: #5c3317;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: rgba(139, 69, 19, 0.06);
  border-color: rgba(139, 69, 19, 0.25);
}

.header-btn.primary {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: #fff;
  border: none;
}

.header-btn.primary:hover {
  background: linear-gradient(135deg, #6d3610, #8B4513);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.right-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-tabs {
  display: flex;
  background: #f0eadd;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  padding: 6px;
  gap: 4px;
  flex-shrink: 0;
}

.left-sidebar .sidebar-tabs {
  background: #e8dfd0;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.side-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 8px;
  background: transparent;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  color: #8B4513;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
}

.side-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.side-tab.active {
  background: #fff;
  color: #5F9EA0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  font-weight: 600;
}

.tab-badge {
  background: rgba(95, 158, 160, 0.2);
  color: #5F9EA0;
  font-size: 10px;
  font-weight: 600;
  padding: 0 6px;
  border-radius: 10px;
  line-height: 1.6;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.left-sidebar .sidebar-content {
  background: #fdfaf4;
}

.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: #fdfaf4;
  border-top: 1px solid rgba(139, 69, 19, 0.08);
  font-size: 11px;
  color: #999;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-toast {
  position: fixed;
  bottom: 50px;
  right: 20px;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.2);
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-width: 280px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-toast p {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #5c3317;
}

.info-toast ul {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #666;
  line-height: 1.8;
}
</style>
