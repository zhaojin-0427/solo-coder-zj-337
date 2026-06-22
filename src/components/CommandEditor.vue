<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Timer,
  Bell,
  Hand,
  Play,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  MessageSquare,
} from 'lucide-vue-next'
import type { StepCommand, RehearsalRole, CeremonyStep, BeatCondition, BeatType } from '@/types'

const props = defineProps<{
  steps: CeremonyStep[]
  currentStepIndex: number
  stepCommands: StepCommand[]
  roles: RehearsalRole[]
}>()

const emit = defineEmits<{
  (e: 'add-command', stepId: string, commandText: string, executorRoleId: string, beatType: BeatType): void
  (e: 'update-command', commandId: string, updates: Partial<StepCommand>): void
  (e: 'delete-command', commandId: string): void
  (e: 'add-wait-condition', commandId: string, condition: BeatCondition): void
  (e: 'update-wait-condition', commandId: string, conditionIndex: number, updates: Partial<BeatCondition>): void
  (e: 'delete-wait-condition', commandId: string, conditionIndex: number): void
  (e: 'step-change', index: number): void
}>()

const expandedSteps = ref<Set<string>>(new Set())

const editingCommandId = ref<string | null>(null)
const editingCommandText = ref('')
const editingExecutor = ref('')
const editingBeatType = ref<BeatType>('instant')
const editingBeatValue = ref('')
const editingBeatCountdown = ref<number | undefined>(undefined)
const editingNotes = ref('')

const editingWaitIndex = ref<{ cmdId: string; index: number } | null>(null)
const newWaitCmdId = ref<string | null>(null)
const newWaitType = ref<BeatType>('previous-finish')
const newWaitValue = ref('')
const newWaitCountdown = ref<number | undefined>(undefined)
const newWaitRoleIds = ref<string[]>([])
const newWaitStepIds = ref<string[]>([])
const newWaitDescription = ref('')

const editingWaitType = ref<BeatType>('instant')
const editingWaitValue = ref('')
const editingWaitCountdown = ref<number | undefined>(undefined)
const editingWaitRoleIds = ref<string[]>([])
const editingWaitStepIds = ref<string[]>([])
const editingWaitDescription = ref('')

const newCommandStepId = ref<string | null>(null)
const newCommandText = ref('')
const newCommandExecutor = ref('')
const newCommandBeatType = ref<BeatType>('instant')

const currentStep = computed(() => props.steps[props.currentStepIndex] || null)

function getCommandsByStepId(stepId: string): StepCommand[] {
  return props.stepCommands.filter(c => c.stepId === stepId)
}

function getRoleName(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.name || '未指派'
}

function getRoleColor(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.color || '#888'
}

function toggleExpand(stepId: string) {
  if (expandedSteps.value.has(stepId)) {
    expandedSteps.value.delete(stepId)
  } else {
    expandedSteps.value.add(stepId)
  }
}

function isExpanded(stepId: string): boolean {
  return expandedSteps.value.has(stepId) || (currentStep.value?.id === stepId)
}

const beatTypeOptions: Array<{ value: BeatType; label: string; icon: any; desc: string }> = [
  { value: 'instant', label: '立即', icon: Play, desc: '步骤开始立即执行' },
  { value: 'countdown', label: '倒计时', icon: Timer, desc: '按拍数倒计时后开始' },
  { value: 'signal', label: '听信号', icon: Bell, desc: '听到特定信号后开始' },
  { value: 'previous-finish', label: '等上步', icon: Clock, desc: '等待前一步口令完成' },
  { value: 'manual', label: '手动', icon: Hand, desc: '手动触发开始' },
]

function getBeatTypeInfo(type: BeatType) {
  return beatTypeOptions.find(b => b.value === type) || beatTypeOptions[0]
}

function formatBeat(cmd: StepCommand): string {
  switch (cmd.beatType) {
    case 'instant': return '立即'
    case 'countdown': return cmd.beatCountdown ? `${cmd.beatCountdown} 拍后` : '倒计时'
    case 'signal': return cmd.beatValue || '听信号'
    case 'previous-finish': return '前序完成'
    case 'manual': return '手动触发'
    default: return ''
  }
}

function formatWaitCondition(cond: BeatCondition): string {
  if (cond.description) return cond.description
  switch (cond.type) {
    case 'instant': return '立即'
    case 'countdown': return cond.value ? `${cond.value} 拍` : '等待'
    case 'signal': return cond.value || '等待信号'
    case 'previous-finish': return '前序完成'
    case 'manual': return '手动'
    default: return ''
  }
}

function startAddCommand(stepId: string) {
  newCommandStepId.value = stepId
  newCommandText.value = ''
  newCommandExecutor.value = ''
  newCommandBeatType.value = 'instant'
  editingCommandId.value = null
}

function cancelAdd() {
  newCommandStepId.value = null
  newCommandText.value = ''
  newCommandExecutor.value = ''
}

function confirmAdd() {
  if (!newCommandStepId.value || !newCommandText.value.trim()) return
  emit('add-command', newCommandStepId.value, newCommandText.value.trim(), newCommandExecutor.value, newCommandBeatType.value)
  cancelAdd()
}

function startEdit(cmd: StepCommand) {
  editingCommandId.value = cmd.id
  editingCommandText.value = cmd.commandText
  editingExecutor.value = cmd.executorRoleId
  editingBeatType.value = cmd.beatType
  editingBeatValue.value = cmd.beatValue || ''
  editingBeatCountdown.value = cmd.beatCountdown
  editingNotes.value = cmd.notes || ''
  cancelAdd()
}

function cancelEdit() {
  editingCommandId.value = null
  editingCommandText.value = ''
  editingExecutor.value = ''
  editingBeatValue.value = ''
  editingBeatCountdown.value = undefined
  editingNotes.value = ''
}

function saveEdit() {
  if (!editingCommandId.value || !editingCommandText.value.trim()) return
  emit('update-command', editingCommandId.value, {
    commandText: editingCommandText.value.trim(),
    executorRoleId: editingExecutor.value,
    beatType: editingBeatType.value,
    beatValue: editingBeatValue.value.trim() || undefined,
    beatCountdown: editingBeatCountdown.value,
    notes: editingNotes.value.trim() || undefined,
  })
  cancelEdit()
}

function handleDelete(cmd: StepCommand) {
  if (confirm(`确定删除口令「${cmd.commandText}」？`)) {
    emit('delete-command', cmd.id)
  }
}

function addWaitCondition(cmdId: string) {
  newWaitCmdId.value = cmdId
  newWaitType.value = 'previous-finish'
  newWaitValue.value = ''
  newWaitCountdown.value = undefined
  newWaitRoleIds.value = []
  newWaitStepIds.value = []
  newWaitDescription.value = ''
  editingWaitIndex.value = null
}

function cancelAddWait() {
  newWaitCmdId.value = null
  newWaitType.value = 'previous-finish'
  newWaitValue.value = ''
  newWaitCountdown.value = undefined
  newWaitRoleIds.value = []
  newWaitStepIds.value = []
  newWaitDescription.value = ''
}

function confirmAddWait(cmdId: string) {
  const condition: BeatCondition = {
    type: newWaitType.value,
    value: newWaitType.value === 'countdown'
      ? (newWaitCountdown.value ? String(newWaitCountdown.value) : undefined)
      : (newWaitValue.value.trim() || undefined),
    waitRoleIds: newWaitRoleIds.value.length > 0 ? [...newWaitRoleIds.value] : undefined,
    waitStepIds: newWaitStepIds.value.length > 0 ? [...newWaitStepIds.value] : undefined,
    description: newWaitDescription.value.trim() || undefined,
  }
  emit('add-wait-condition', cmdId, condition)
  cancelAddWait()
}

function startEditWait(cmdId: string, index: number, cond: BeatCondition) {
  editingWaitIndex.value = { cmdId, index }
  editingWaitType.value = cond.type
  editingWaitValue.value = (cond.type === 'countdown') ? '' : (cond.value || '')
  editingWaitCountdown.value = (cond.type === 'countdown' && cond.value) ? Number(cond.value) : undefined
  editingWaitRoleIds.value = cond.waitRoleIds ? [...cond.waitRoleIds] : []
  editingWaitStepIds.value = cond.waitStepIds ? [...cond.waitStepIds] : []
  editingWaitDescription.value = cond.description || ''
  cancelAddWait()
}

function cancelEditWait() {
  editingWaitIndex.value = null
  editingWaitType.value = 'instant'
  editingWaitValue.value = ''
  editingWaitCountdown.value = undefined
  editingWaitRoleIds.value = []
  editingWaitStepIds.value = []
  editingWaitDescription.value = ''
}

function saveEditWait(cmdId: string, index: number) {
  const updates: Partial<BeatCondition> = {
    type: editingWaitType.value,
    value: editingWaitType.value === 'countdown'
      ? (editingWaitCountdown.value ? String(editingWaitCountdown.value) : undefined)
      : (editingWaitValue.value.trim() || undefined),
    waitRoleIds: editingWaitRoleIds.value.length > 0 ? [...editingWaitRoleIds.value] : undefined,
    waitStepIds: editingWaitStepIds.value.length > 0 ? [...editingWaitStepIds.value] : undefined,
    description: editingWaitDescription.value.trim() || undefined,
  }
  emit('update-wait-condition', cmdId, index, updates)
  cancelEditWait()
}

function handleDeleteWait(cmdId: string, index: number) {
  if (confirm('确定删除该等待条件？')) {
    emit('delete-wait-condition', cmdId, index)
    if (editingWaitIndex.value?.cmdId === cmdId && editingWaitIndex.value.index === index) {
      cancelEditWait()
    }
  }
}

function toggleWaitRole(roleId: string, list: string[]) {
  const i = list.indexOf(roleId)
  if (i >= 0) list.splice(i, 1)
  else list.push(roleId)
}

function toggleWaitStep(stepId: string, list: string[]) {
  const i = list.indexOf(stepId)
  if (i >= 0) list.splice(i, 1)
  else list.push(stepId)
}

function getStepName(stepId: string): string {
  return props.steps.find(s => s.id === stepId)?.title || stepId
}

function getWaitTypeOptions() {
  return beatTypeOptions
}
</script>

<template>
  <div class="command-editor">
    <div class="ce-header">
      <div class="ce-title-row">
        <MessageSquare class="w-4 h-4" />
        <h4 class="ce-title">口令编排</h4>
        <span class="ce-count">{{ stepCommands.length }} 条</span>
      </div>
    </div>

    <div class="ce-list">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-block"
        :class="{ current: index === currentStepIndex }"
      >
        <div class="step-header" @click="emit('step-change', index)">
          <div class="step-indicator">
            <div class="step-order">{{ step.order }}</div>
            <ChevronDown v-if="isExpanded(step.id)" class="w-4 h-4 chevron" />
            <ChevronRight v-else class="w-4 h-4 chevron" />
          </div>
          <div class="step-info">
            <div class="step-name">{{ step.title }}</div>
            <div class="step-cmd-count">
              {{ getCommandsByStepId(step.id).length }} 条口令
            </div>
          </div>
        </div>

        <div v-if="isExpanded(step.id)" class="step-content">
          <div class="command-list">
            <div
              v-for="cmd in getCommandsByStepId(step.id)"
              :key="cmd.id"
              class="command-item"
            >
              <template v-if="editingCommandId === cmd.id">
                <div class="command-edit">
                  <div class="edit-row">
                    <input
                      v-model="editingCommandText"
                      type="text"
                      class="ce-input"
                      placeholder="口令内容"
                      @keyup.enter="saveEdit"
                      @keyup.esc="cancelEdit"
                    />
                  </div>
                  <div class="edit-row multi">
                    <div class="edit-field">
                      <label class="edit-label">执行人</label>
                      <select v-model="editingExecutor" class="ce-select">
                        <option value="">未指派</option>
                        <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                      </select>
                    </div>
                    <div class="edit-field">
                      <label class="edit-label">起拍方式</label>
                      <select v-model="editingBeatType" class="ce-select">
                        <option v-for="b in beatTypeOptions" :key="b.value" :value="b.value">{{ b.label }}</option>
                      </select>
                    </div>
                  </div>
                  <div v-if="editingBeatType === 'signal'" class="edit-row">
                    <label class="edit-label">信号描述</label>
                    <input
                      v-model="editingBeatValue"
                      type="text"
                      class="ce-input"
                      placeholder="如：鼓声、钟响…"
                    />
                  </div>
                  <div v-if="editingBeatType === 'countdown'" class="edit-row">
                    <label class="edit-label">倒计时拍数</label>
                    <input
                      v-model.number="editingBeatCountdown"
                      type="number"
                      min="1"
                      class="ce-input sm"
                    />
                  </div>
                  <div class="edit-row">
                    <label class="edit-label">备注</label>
                    <textarea
                      v-model="editingNotes"
                      class="ce-textarea"
                      placeholder="口令备注（可选）"
                      rows="2"
                    ></textarea>
                  </div>
                  <div class="edit-actions">
                    <button class="ce-btn-sm primary" @click="saveEdit">
                      <Check class="w-3 h-3" /> 保存
                    </button>
                    <button class="ce-btn-sm" @click="cancelEdit">
                      <X class="w-3 h-3" /> 取消
                    </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="command-main">
                  <div class="command-role" v-if="cmd.executorRoleId" :style="{ borderColor: getRoleColor(cmd.executorRoleId) }">
                    <Users class="w-3 h-3" />
                    <span :style="{ color: getRoleColor(cmd.executorRoleId) }">{{ getRoleName(cmd.executorRoleId) }}</span>
                  </div>
                  <div class="command-role unassigned" v-else>
                    <AlertCircle class="w-3 h-3" />
                    <span>未指派</span>
                  </div>
                  <div class="command-text">{{ cmd.commandText }}</div>
                </div>

                <div class="command-meta">
                  <div class="meta-item beat">
                    <component :is="getBeatTypeInfo(cmd.beatType).icon" class="w-3 h-3" />
                    <span>{{ formatBeat(cmd) }}</span>
                  </div>
                  <div v-if="cmd.notes" class="meta-item notes">
                    <span>{{ cmd.notes }}</span>
                  </div>
                </div>

                <div v-if="cmd.waitConditions.length > 0" class="wait-list">
                  <div
                    v-for="(wc, wi) in cmd.waitConditions"
                    :key="wi"
                    class="wait-item"
                  >
                    <template v-if="editingWaitIndex?.cmdId === cmd.id && editingWaitIndex?.index === wi">
                      <div class="wait-edit">
                        <div class="wait-edit-row">
                          <label class="wait-edit-label">等待类型</label>
                          <select v-model="editingWaitType" class="ce-select sm">
                            <option v-for="b in beatTypeOptions" :key="b.value" :value="b.value">{{ b.label }}</option>
                          </select>
                        </div>
                        <div v-if="editingWaitType === 'countdown'" class="wait-edit-row">
                          <label class="wait-edit-label">等待拍数</label>
                          <input v-model.number="editingWaitCountdown" type="number" min="1" class="ce-input sm" />
                        </div>
                        <div v-if="editingWaitType === 'signal'" class="wait-edit-row">
                          <label class="wait-edit-label">信号说明</label>
                          <input v-model="editingWaitValue" type="text" class="ce-input" placeholder="如：鼓声三下" />
                        </div>
                        <div class="wait-edit-row multi">
                          <div class="wait-edit-field">
                            <label class="wait-edit-label">等待角色</label>
                            <div class="chip-select">
                              <span
                                v-for="r in roles"
                                :key="r.id"
                                class="chip-option"
                                :class="{ selected: editingWaitRoleIds.includes(r.id) }"
                                :style="editingWaitRoleIds.includes(r.id) ? { borderColor: r.color, color: r.color, background: r.color + '15' } : {}"
                                @click="toggleWaitRole(r.id, editingWaitRoleIds)"
                              >{{ r.name }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="wait-edit-row multi">
                          <div class="wait-edit-field">
                            <label class="wait-edit-label">等待步骤</label>
                            <div class="chip-select">
                              <span
                                v-for="s in steps"
                                :key="s.id"
                                class="chip-option"
                                :class="{ selected: editingWaitStepIds.includes(s.id) }"
                                @click="toggleWaitStep(s.id, editingWaitStepIds)"
                              >{{ s.order }}.{{ s.title }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="wait-edit-row">
                          <label class="wait-edit-label">等待说明</label>
                          <input v-model="editingWaitDescription" type="text" class="ce-input" placeholder="如：奉茶完毕后" />
                        </div>
                        <div class="wait-edit-actions">
                          <button class="ce-btn-sm primary" @click="saveEditWait(cmd.id, wi)">
                            <Check class="w-3 h-3" /> 保存
                          </button>
                          <button class="ce-btn-sm" @click="cancelEditWait">
                            <X class="w-3 h-3" /> 取消
                          </button>
                          <button class="ce-btn-sm danger" @click="handleDeleteWait(cmd.id, wi)">
                            <Trash2 class="w-3 h-3" /> 删除
                          </button>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="wait-card" @click="startEditWait(cmd.id, wi, wc)">
                        <div class="wait-card-header">
                          <Clock class="w-3 h-3" />
                          <span class="wait-card-type">{{ getBeatTypeInfo(wc.type).label }}</span>
                          <span class="wait-card-desc">{{ formatWaitCondition(wc) }}</span>
                        </div>
                        <div v-if="wc.waitRoleIds && wc.waitRoleIds.length" class="wait-card-meta">
                          <Users class="w-3 h-3" />
                          <span v-for="rid in wc.waitRoleIds" :key="rid" class="wait-meta-chip"
                                :style="{ borderColor: getRoleColor(rid), color: getRoleColor(rid) }">
                            {{ getRoleName(rid) }}
                          </span>
                        </div>
                        <div v-if="wc.waitStepIds && wc.waitStepIds.length" class="wait-card-meta">
                          <Play class="w-3 h-3" />
                          <span v-for="sid in wc.waitStepIds" :key="sid" class="wait-meta-chip step">
                            {{ getStepName(sid) }}
                          </span>
                        </div>
                        <button
                          class="wait-delete-btn"
                          title="删除等待条件"
                          @click.stop="handleDeleteWait(cmd.id, wi)"
                        >
                          <Trash2 class="w-3 h-3" />
                        </button>
                      </div>
                    </template>
                  </div>
                </div>

                <div v-if="newWaitCmdId === cmd.id" class="wait-edit add-wait">
                  <div class="wait-edit-header">
                    <span class="wait-edit-title">新增等待条件</span>
                  </div>
                  <div class="wait-edit-row">
                    <label class="wait-edit-label">等待类型</label>
                    <select v-model="newWaitType" class="ce-select sm">
                      <option v-for="b in beatTypeOptions" :key="b.value" :value="b.value">{{ b.label }}</option>
                    </select>
                  </div>
                  <div v-if="newWaitType === 'countdown'" class="wait-edit-row">
                    <label class="wait-edit-label">等待拍数</label>
                    <input v-model.number="newWaitCountdown" type="number" min="1" class="ce-input sm" />
                  </div>
                  <div v-if="newWaitType === 'signal'" class="wait-edit-row">
                    <label class="wait-edit-label">信号说明</label>
                    <input v-model="newWaitValue" type="text" class="ce-input" placeholder="如：鼓声三下" />
                  </div>
                  <div class="wait-edit-row multi">
                    <div class="wait-edit-field">
                      <label class="wait-edit-label">等待角色</label>
                      <div class="chip-select">
                        <span
                          v-for="r in roles"
                          :key="r.id"
                          class="chip-option"
                          :class="{ selected: newWaitRoleIds.includes(r.id) }"
                          :style="newWaitRoleIds.includes(r.id) ? { borderColor: r.color, color: r.color, background: r.color + '15' } : {}"
                          @click="toggleWaitRole(r.id, newWaitRoleIds)"
                        >{{ r.name }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="wait-edit-row multi">
                    <div class="wait-edit-field">
                      <label class="wait-edit-label">等待步骤</label>
                      <div class="chip-select">
                        <span
                          v-for="s in steps"
                          :key="s.id"
                          class="chip-option"
                          :class="{ selected: newWaitStepIds.includes(s.id) }"
                          @click="toggleWaitStep(s.id, newWaitStepIds)"
                        >{{ s.order }}.{{ s.title }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="wait-edit-row">
                    <label class="wait-edit-label">等待说明</label>
                    <input v-model="newWaitDescription" type="text" class="ce-input" placeholder="如：奉茶完毕后" />
                  </div>
                  <div class="wait-edit-actions">
                    <button class="ce-btn-sm primary" @click="confirmAddWait(cmd.id)">
                      <Check class="w-3 h-3" /> 确认添加
                    </button>
                    <button class="ce-btn-sm" @click="cancelAddWait">
                      <X class="w-3 h-3" /> 取消
                    </button>
                  </div>
                </div>

                <div class="command-actions">
                  <button
                    class="ce-icon-btn"
                    title="新增等待条件"
                    @click="addWaitCondition(cmd.id)"
                  >
                    <Plus class="w-3 h-3" />
                  </button>
                  <button
                    class="ce-icon-btn"
                    title="编辑口令"
                    @click="startEdit(cmd)"
                  >
                    <Pencil class="w-3 h-3" />
                  </button>
                  <button
                    class="ce-icon-btn danger"
                    title="删除口令"
                    @click="handleDelete(cmd)"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </template>
            </div>

            <div v-if="newCommandStepId === step.id" class="add-command-form">
              <input
                v-model="newCommandText"
                type="text"
                class="ce-input"
                placeholder="输入口令内容…"
                @keyup.enter="confirmAdd"
                @keyup.esc="cancelAdd"
              />
              <div class="add-form-row">
                <select v-model="newCommandExecutor" class="ce-select sm">
                  <option value="">执行人</option>
                  <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                </select>
                <select v-model="newCommandBeatType" class="ce-select sm">
                  <option v-for="b in beatTypeOptions" :key="b.value" :value="b.value">{{ b.label }}</option>
                </select>
              </div>
              <div class="add-form-actions">
                <button class="ce-btn-sm primary" @click="confirmAdd">
                  <Check class="w-3 h-3" /> 添加
                </button>
                <button class="ce-btn-sm" @click="cancelAdd">
                  <X class="w-3 h-3" /> 取消
                </button>
              </div>
            </div>

            <button
              v-if="newCommandStepId !== step.id"
              class="add-command-btn"
              @click="startAddCommand(step.id)"
            >
              <Plus class="w-3 h-3" />
              添加口令
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.command-editor {
  display: flex;
  flex-direction: column;
  background: #fff;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.ce-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
  flex-shrink: 0;
}

.ce-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5c3317;
}

.ce-title {
  font-size: 13px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
}

.ce-count {
  font-size: 11px;
  color: #999;
  background: rgba(212, 175, 55, 0.1);
  padding: 1px 8px;
  border-radius: 10px;
}

.ce-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.step-block {
  border-radius: 10px;
  margin-bottom: 6px;
  border: 1px solid rgba(139, 69, 19, 0.08);
  overflow: hidden;
  transition: all 0.2s;
}

.step-block.current {
  border-color: rgba(95, 158, 160, 0.4);
  background: rgba(95, 158, 160, 0.03);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  background: #faf7f0;
  transition: background 0.2s;
}

.step-header:hover {
  background: #f5efe0;
}

.step-block.current .step-header {
  background: rgba(95, 158, 160, 0.08);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-order {
  width: 22px;
  height: 22px;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #8B4513;
}

.step-block.current .step-order {
  background: #5F9EA0;
  color: #fff;
}

.chevron {
  color: #999;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-name {
  font-size: 12px;
  font-weight: 600;
  color: #2C2C2C;
}

.step-cmd-count {
  font-size: 10px;
  color: #999;
  margin-top: 1px;
}

.step-content {
  padding: 8px 10px 10px;
  background: #fff;
  border-top: 1px solid rgba(139, 69, 19, 0.05);
}

.command-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.command-item {
  background: #fdfaf4;
  border: 1px solid rgba(139, 69, 19, 0.08);
  border-radius: 8px;
  padding: 8px 10px;
}

.command-main {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.command-role {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border-left: 3px solid;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.command-role.unassigned {
  border-left-color: #ccc;
  color: #999;
}

.command-text {
  font-size: 12px;
  font-weight: 500;
  color: #2C2C2C;
  line-height: 1.5;
  flex: 1;
}

.command-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
  padding-left: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #666;
}

.meta-item.beat {
  background: rgba(95, 158, 160, 0.1);
  color: #5F9EA0;
  padding: 2px 8px;
  border-radius: 10px;
}

.meta-item.wait {
  background: rgba(212, 175, 55, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.wait-chip {
  display: inline-flex;
  align-items: center;
}

.meta-item.notes {
  color: #999;
  font-style: italic;
  flex: 1 100%;
}

.command-actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.ce-icon-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.ce-icon-btn:hover {
  background: rgba(139, 69, 19, 0.08);
  color: #5c3317;
}

.ce-icon-btn.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.command-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.edit-row.multi {
  flex-direction: row;
  gap: 8px;
}

.edit-row.multi .edit-field {
  flex: 1;
  min-width: 0;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.edit-label {
  font-size: 10px;
  color: #888;
  padding-left: 2px;
}

.ce-input {
  padding: 5px 8px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.ce-input:focus {
  border-color: #5F9EA0;
}

.ce-input.sm {
  max-width: 100px;
}

.ce-select {
  padding: 5px 8px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 11px;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.ce-select.sm {
  padding: 4px 6px;
}

.ce-select:focus {
  border-color: #5F9EA0;
}

.ce-textarea {
  padding: 5px 8px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 11px;
  background: #fff;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.ce-btn-sm {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 11px;
  color: #5c3317;
  cursor: pointer;
}

.ce-btn-sm.primary {
  background: #5F9EA0;
  border-color: #5F9EA0;
  color: #fff;
}

.add-command-form {
  margin-top: 6px;
  padding: 8px;
  background: rgba(95, 158, 160, 0.04);
  border: 1px dashed rgba(95, 158, 160, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.add-form-row {
  display: flex;
  gap: 6px;
}

.add-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.add-command-btn {
  margin-top: 6px;
  width: 100%;
  padding: 6px 10px;
  background: transparent;
  border: 1px dashed rgba(139, 69, 19, 0.2);
  border-radius: 6px;
  font-size: 11px;
  color: #8B4513;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
}

.add-command-btn:hover {
  background: rgba(139, 69, 19, 0.04);
  border-color: rgba(139, 69, 19, 0.4);
}

.wait-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 6px;
}

.wait-item {
  width: 100%;
}

.wait-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 28px 6px 8px;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.wait-card:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
}

.wait-card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #8a6d1f;
}

.wait-card-type {
  font-weight: 600;
}

.wait-card-desc {
  color: #6b5610;
}

.wait-card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 9px;
  color: #888;
}

.wait-meta-chip {
  padding: 1px 6px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 9px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.5);
}

.wait-meta-chip.step {
  border-color: rgba(95, 158, 160, 0.5);
  color: #5F9EA0;
  background: rgba(95, 158, 160, 0.08);
}

.wait-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.wait-delete-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.wait-edit {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 236, 179, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 6px;
}

.wait-edit.add-wait {
  background: rgba(95, 158, 160, 0.06);
  border-color: rgba(95, 158, 160, 0.3);
  border-style: dashed;
}

.wait-edit-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #5c3317;
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(139, 69, 19, 0.1);
}

.wait-edit-title {
  color: #8a6d1f;
}

.wait-edit.add-wait .wait-edit-title {
  color: #5F9EA0;
}

.wait-edit-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wait-edit-row.multi {
  flex-direction: column;
}

.wait-edit-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wait-edit-label {
  font-size: 10px;
  color: #888;
  padding-left: 2px;
}

.chip-select {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip-option {
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  background: #fff;
  font-size: 10px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.chip-option:hover {
  border-color: rgba(95, 158, 160, 0.4);
}

.chip-option.selected {
  font-weight: 500;
}

.wait-edit-actions {
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  padding-top: 2px;
  border-top: 1px dashed rgba(139, 69, 19, 0.08);
}
</style>
