<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Printer, Download, ZoomIn, ZoomOut, Type, Compass, ArrowRight, Users, ClipboardList, UserSquare } from 'lucide-vue-next'
import type { CeremonyStep, CeremonyTemplate, PrintSettings, PrintFontSize, CanvasElement, RehearsalRole, StepCommand } from '@/types'

const props = defineProps<{
  isOpen: boolean
  template: CeremonyTemplate | undefined
  steps: CeremonyStep[]
  schemeName: string
  elements: CanvasElement[]
  defaultSettings?: PrintSettings
  roles: RehearsalRole[]
  stepCommands: StepCommand[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update-settings', settings: PrintSettings): void
}>()

const zoom = ref(1)

const fontSize = ref<PrintFontSize>(props.defaultSettings?.fontSize || 'standard')
const showDirection = ref<boolean>(props.defaultSettings?.showDirection !== false)
const showDeliveryRoute = ref<boolean>(props.defaultSettings?.showDeliveryRoute !== false)
const showRoleAssignment = ref<boolean>(props.defaultSettings?.showRoleAssignment !== false)
const showRoleCommands = ref<boolean>(props.defaultSettings?.showRoleCommands !== false)

const formattedDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
})

const sortedRoles = computed(() => {
  return [...props.roles].sort((a, b) => a.order - b.order)
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

function toggleFontSize() {
  fontSize.value = fontSize.value === 'standard' ? 'large' : 'standard'
  emitUpdate()
}

function toggleShowDirection() {
  showDirection.value = !showDirection.value
  emitUpdate()
}

function toggleShowDeliveryRoute() {
  showDeliveryRoute.value = !showDeliveryRoute.value
  emitUpdate()
}

function toggleShowRoleAssignment() {
  showRoleAssignment.value = !showRoleAssignment.value
  emitUpdate()
}

function toggleShowRoleCommands() {
  showRoleCommands.value = !showRoleCommands.value
  emitUpdate()
}

function getElementLabel(elementId: string): string {
  const element = props.elements.find(el => el.id === elementId)
  if (element) return element.label
  const roleMatch = elementId.match(/-(seat|table|mat|vessel|candle|incense|flower|crown|altar)$/)
  if (roleMatch) {
    return elementId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
  }
  return elementId
}

function getRoleName(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.name || '未指派'
}

function getRoleColor(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.color || '#888'
}

function getElementsByRoleId(roleId: string): CanvasElement[] {
  return props.elements.filter(el => el.roleId === roleId)
}

function getCommandsByRoleId(roleId: string): StepCommand[] {
  return props.stepCommands.filter(c => c.executorRoleId === roleId)
}

function getCommandsByStepId(stepId: string): StepCommand[] {
  return props.stepCommands.filter(c => c.stepId === stepId)
}

function getStepTitle(stepId: string): string {
  return props.steps.find(s => s.id === stepId)?.title || stepId
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

function emitUpdate() {
  emit('update-settings', {
    fontSize: fontSize.value,
    showDirection: showDirection.value,
    showDeliveryRoute: showDeliveryRoute.value,
    showRoleAssignment: showRoleAssignment.value,
    showRoleCommands: showRoleCommands.value,
  })
}

const cardClass = computed(() => ({
  'large-font': fontSize.value === 'large',
}))
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
          <div class="toolbar-divider"></div>
          <div class="settings-group">
            <button
              class="toolbar-btn setting-btn"
              :class="{ active: fontSize === 'large' }"
              title="大字版"
              @click="toggleFontSize"
            >
              <Type class="w-4 h-4" />
              <span>大字版</span>
            </button>
            <button
              class="toolbar-btn setting-btn"
              :class="{ active: showDirection }"
              title="显示方向提示"
              @click="toggleShowDirection"
            >
              <Compass class="w-4 h-4" />
              <span>方向</span>
            </button>
            <button
              class="toolbar-btn setting-btn"
              :class="{ active: showDeliveryRoute }"
              title="显示器物递送路线"
              @click="toggleShowDeliveryRoute"
            >
              <ArrowRight class="w-4 h-4" />
              <span>递送</span>
            </button>
            <button
              class="toolbar-btn setting-btn"
              :class="{ active: showRoleAssignment }"
              title="显示角色分工表"
              @click="toggleShowRoleAssignment"
            >
              <UserSquare class="w-4 h-4" />
              <span>分工</span>
            </button>
            <button
              class="toolbar-btn setting-btn"
              :class="{ active: showRoleCommands }"
              title="显示角色口令表"
              @click="toggleShowRoleCommands"
            >
              <ClipboardList class="w-4 h-4" />
              <span>口令表</span>
            </button>
          </div>
          <div class="toolbar-divider"></div>
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
        <div class="print-card" :class="cardClass" :style="{ transform: `scale(${zoom})` }">
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
                  <span v-if="showDirection && step.direction" class="tag direction-tag">
                    <Compass class="w-3 h-3 tag-icon" />
                    {{ step.direction }}
                  </span>
                  <span v-if="step.duration" class="tag">{{ step.duration }}</span>
                </div>
                <div v-if="showDeliveryRoute && step.deliveryRoute" class="step-delivery">
                  <ArrowRight class="w-3 h-3 delivery-icon" />
                  <span>{{ getElementLabel(step.deliveryRoute.from) }}</span>
                  <span class="delivery-arrow">→</span>
                  <span class="delivery-item">{{ step.deliveryRoute.item }}</span>
                  <span class="delivery-arrow">→</span>
                  <span>{{ getElementLabel(step.deliveryRoute.to) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="showRoleAssignment && roles.length > 0" class="card-section role-assignment">
            <div class="section-header">
              <UserSquare class="w-5 h-5" />
              <h3 class="section-title">角色分工总览</h3>
            </div>
            <div class="role-assignment-grid">
              <div
                v-for="role in sortedRoles"
                :key="role.id"
                class="role-block"
              >
                <div class="role-block-header" :style="{ borderColor: role.color, backgroundColor: role.color + '12' }">
                  <div class="rb-color" :style="{ backgroundColor: role.color }"></div>
                  <div class="rb-name" :style="{ color: role.color }">
                    <span class="rb-order">{{ role.order }}.</span>
                    {{ role.name }}
                  </div>
                  <span class="rb-stats">{{ getElementsByRoleId(role.id).length }}项·{{ getCommandsByRoleId(role.id).length }}令</span>
                </div>
                <div v-if="role.description" class="rb-desc">{{ role.description }}</div>
                <div class="rb-elements">
                  <div class="rb-subtitle">负责席位器物</div>
                  <div v-if="getElementsByRoleId(role.id).length > 0" class="rb-tags">
                    <span v-for="el in getElementsByRoleId(role.id)" :key="el.id" class="rb-tag element">
                      {{ el.label }}
                    </span>
                  </div>
                  <div v-else class="rb-empty">暂无绑定</div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="showRoleCommands && stepCommands.length > 0" class="card-section role-commands">
            <div class="section-header">
              <ClipboardList class="w-5 h-5" />
              <h3 class="section-title">角色分工口令表</h3>
            </div>
            <div class="command-table-wrapper">
              <table class="command-table">
                <thead>
                  <tr>
                    <th class="col-step">步骤</th>
                    <th class="col-role">执行人</th>
                    <th class="col-cmd">口令内容</th>
                    <th class="col-beat">起拍</th>
                    <th class="col-wait">等待条件</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="step in steps" :key="step.id">
                    <tr
                      v-for="(cmd, cmdIdx) in getCommandsByStepId(step.id)"
                      :key="cmd.id"
                      class="cmd-table-row"
                    >
                      <td v-if="cmdIdx === 0" :rowspan="Math.max(getCommandsByStepId(step.id).length, 1)" class="step-cell">
                        <div class="sc-order">{{ String(step.order).padStart(2, '0') }}</div>
                        <div class="sc-title">{{ step.title }}</div>
                      </td>
                      <td class="role-cell">
                        <span
                          v-if="cmd.executorRoleId"
                          class="role-pill"
                          :style="{ borderColor: getRoleColor(cmd.executorRoleId), color: getRoleColor(cmd.executorRoleId) }"
                        >
                          {{ getRoleName(cmd.executorRoleId) }}
                        </span>
                        <span v-else class="role-pill unassigned">未指派</span>
                      </td>
                      <td class="cmd-cell">{{ cmd.commandText }}</td>
                      <td class="beat-cell">
                        <span class="beat-chip">{{ formatBeat(cmd) }}</span>
                      </td>
                      <td class="wait-cell">
                        <template v-if="cmd.waitConditions.length > 0">
                          <span
                            v-for="(wc, wi) in cmd.waitConditions"
                            :key="wi"
                            class="wait-chip"
                          >
                            {{ wc.description || (wc.type === 'previous-finish' ? '前序完成' : (wc.value || wc.type)) }}
                          </span>
                        </template>
                        <span v-else class="wait-chip none">—</span>
                      </td>
                    </tr>
                    <tr v-if="getCommandsByStepId(step.id).length === 0" :key="step.id + '-empty'">
                      <td class="step-cell">
                        <div class="sc-order">{{ String(step.order).padStart(2, '0') }}</div>
                        <div class="sc-title">{{ step.title }}</div>
                      </td>
                      <td colspan="4" class="no-commands">（本步暂无口令）</td>
                    </tr>
                  </template>
                </tbody>
              </table>
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
  flex-shrink: 0;
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

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 8px;
}

.settings-group {
  display: flex;
  gap: 6px;
}

.setting-btn {
  flex-direction: column !important;
  padding: 6px 10px !important;
  gap: 2px !important;
  font-size: 10px !important;
  min-width: 56px;
}

.setting-btn.active {
  background: rgba(95, 158, 160, 0.25) !important;
  border-color: #5F9EA0 !important;
  color: #9fd5d7 !important;
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
  transition: all 0.2s ease;
}

.print-card.large-font {
  padding: 40px 50px;
}

.print-card.large-font .title-chinese {
  font-size: 44px;
}

.print-card.large-font .title-english {
  font-size: 13px;
}

.print-card.large-font .scheme-name {
  font-size: 18px;
}

.print-card.large-font .step-order {
  width: 64px;
  height: 64px;
}

.print-card.large-font .order-number {
  font-size: 24px;
}

.print-card.large-font .step-name {
  font-size: 22px;
}

.print-card.large-font .step-desc {
  font-size: 16px;
}

.print-card.large-font .tag {
  font-size: 13px;
  padding: 4px 12px;
}

.print-card.large-font .step-delivery {
  font-size: 14px;
}

.print-card.large-font .card-step {
  gap: 24px;
}

.print-card.large-font .card-steps {
  gap: 28px;
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
  margin-bottom: 8px;
}

.tag {
  font-size: 11px;
  color: #8B4513;
  background: rgba(139, 69, 19, 0.08);
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-icon {
  flex-shrink: 0;
}

.direction-tag {
  background: rgba(95, 158, 160, 0.1);
  border-color: rgba(95, 158, 160, 0.2);
  color: #5F9EA0;
}

.step-delivery {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  padding: 8px 12px;
  background: rgba(212, 175, 55, 0.08);
  border-radius: 6px;
  border-left: 3px solid #D4AF37;
}

.delivery-icon {
  color: #D4AF37;
  flex-shrink: 0;
}

.delivery-arrow {
  color: #D4AF37;
  font-weight: 600;
  margin: 0 2px;
}

.delivery-item {
  background: rgba(212, 175, 55, 0.18);
  padding: 2px 8px;
  border-radius: 4px;
  color: #8B6914;
  font-size: 11px;
  font-weight: 500;
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

.card-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(139, 69, 19, 0.12);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #5F9EA0;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #5F9EA0;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  letter-spacing: 2px;
}

.role-assignment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.role-block {
  background: #fffef9;
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
  transition: all 0.2s;
}

.role-block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border-left: 3px solid;
  margin-bottom: 8px;
}

.rb-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.rb-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rb-order {
  font-size: 11px;
  opacity: 0.7;
}

.rb-stats {
  font-size: 10px;
  color: #999;
  background: rgba(255, 255, 255, 0.8);
  padding: 1px 8px;
  border-radius: 10px;
}

.rb-desc {
  font-size: 11px;
  color: #888;
  margin-bottom: 8px;
  padding: 0 4px;
  line-height: 1.5;
}

.rb-elements {
  padding: 0 4px;
}

.rb-subtitle {
  font-size: 10px;
  color: #aaa;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.rb-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(139, 69, 19, 0.06);
  color: #5c3317;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.rb-empty {
  font-size: 10px;
  color: #ccc;
}

.command-table-wrapper {
  background: #fffef9;
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.command-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.command-table thead th {
  background: rgba(95, 158, 160, 0.1);
  color: #5F9EA0;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  border-bottom: 2px solid rgba(95, 158, 160, 0.2);
}

.command-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
  vertical-align: top;
}

.command-table tbody tr:last-child td {
  border-bottom: none;
}

.command-table tbody tr:nth-child(even) td {
  background: rgba(139, 69, 19, 0.02);
}

.col-step {
  width: 80px;
}

.col-role {
  width: 70px;
}

.col-beat {
  width: 60px;
}

.col-wait {
  width: 110px;
}

.step-cell {
  border-right: 1px solid rgba(139, 69, 19, 0.08);
  background: rgba(139, 69, 19, 0.04) !important;
}

.sc-order {
  font-size: 16px;
  font-weight: 700;
  color: #8B4513;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  line-height: 1;
  margin-bottom: 4px;
}

.sc-title {
  font-size: 11px;
  color: #5c3317;
  font-weight: 500;
  line-height: 1.3;
}

.role-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
  border-left-width: 3px;
  background: rgba(255, 255, 255, 0.9);
}

.role-pill.unassigned {
  color: #999;
  border-color: #ddd;
  background: #f5f5f5;
}

.cmd-cell {
  color: #2C2C2C;
  font-weight: 500;
  line-height: 1.5;
}

.beat-cell {
  color: #8B4513;
}

.beat-chip {
  display: inline-block;
  background: rgba(139, 69, 19, 0.08);
  border: 1px solid rgba(139, 69, 19, 0.15);
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.wait-cell {
  color: #8B6914;
}

.wait-chip {
  display: inline-block;
  margin: 1px 2px 1px 0;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.wait-chip.none {
  background: transparent;
  border: none;
  color: #ccc;
}

.no-commands {
  text-align: center;
  color: #bbb;
  font-size: 11px;
  padding: 12px !important;
}

.print-card.large-font .section-title {
  font-size: 22px;
}

.print-card.large-font .role-block {
  padding: 16px 18px;
}

.print-card.large-font .rb-name {
  font-size: 17px;
}

.print-card.large-font .rb-desc {
  font-size: 13px;
}

.print-card.large-font .rb-tag {
  font-size: 12px;
  padding: 3px 10px;
}

.print-card.large-font .command-table {
  font-size: 13px;
}

.print-card.large-font .sc-order {
  font-size: 19px;
}

.print-card.large-font .sc-title {
  font-size: 13px;
}
</style>
