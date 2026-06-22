<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  UserPlus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Users,
  Eye,
  EyeOff,
  Palette,
} from 'lucide-vue-next'
import type { RehearsalRole, CanvasElement } from '@/types'
import { DEFAULT_ROLE_COLORS } from '@/types'

const props = defineProps<{
  roles: RehearsalRole[]
  elements: CanvasElement[]
  highlightedRoleId: string | null
}>()

const emit = defineEmits<{
  (e: 'add-role', name: string, description?: string): void
  (e: 'update-role', roleId: string, updates: Partial<RehearsalRole>): void
  (e: 'delete-role', roleId: string): void
  (e: 'reorder-role', roleId: string, newOrder: number): void
  (e: 'highlight-role', roleId: string | null): void
}>()

const showAddForm = ref(false)
const newRoleName = ref('')
const newRoleDesc = ref('')
const editingRoleId = ref<string | null>(null)
const editingRoleName = ref('')
const editingRoleDesc = ref('')
const showColorPickerFor = ref<string | null>(null)

const sortedRoles = computed(() => {
  return [...props.roles].sort((a, b) => a.order - b.order)
})

function getElementCountForRole(roleId: string): number {
  return props.elements.filter(el => el.roleId === roleId).length
}

function getRoleLabel(roleId: string): string {
  return props.roles.find(r => r.id === roleId)?.name || '未指定'
}

function handleAddRole() {
  if (!newRoleName.value.trim()) return
  emit('add-role', newRoleName.value.trim(), newRoleDesc.value.trim() || undefined)
  newRoleName.value = ''
  newRoleDesc.value = ''
  showAddForm.value = false
}

function startEdit(role: RehearsalRole) {
  editingRoleId.value = role.id
  editingRoleName.value = role.name
  editingRoleDesc.value = role.description || ''
  showColorPickerFor.value = null
}

function cancelEdit() {
  editingRoleId.value = null
  editingRoleName.value = ''
  editingRoleDesc.value = ''
}

function saveEdit() {
  if (!editingRoleId.value || !editingRoleName.value.trim()) return
  emit('update-role', editingRoleId.value, {
    name: editingRoleName.value.trim(),
    description: editingRoleDesc.value.trim() || undefined,
  })
  cancelEdit()
}

function handleDelete(roleId: string) {
  const role = props.roles.find(r => r.id === roleId)
  const count = getElementCountForRole(roleId)
  let msg = `确定要删除角色「${role?.name}」吗？`
  if (count > 0) {
    msg += `\n\n该角色绑定了 ${count} 个席位/器物，删除后这些元素将解除绑定。`
  }
  if (confirm(msg)) {
    emit('delete-role', roleId)
  }
}

function moveRoleUp(role: RehearsalRole) {
  if (role.order > 1) {
    emit('reorder-role', role.id, role.order - 1)
  }
}

function moveRoleDown(role: RehearsalRole) {
  if (role.order < props.roles.length) {
    emit('reorder-role', role.id, role.order + 1)
  }
}

function toggleHighlight(roleId: string) {
  if (props.highlightedRoleId === roleId) {
    emit('highlight-role', null)
  } else {
    emit('highlight-role', roleId)
  }
}

function selectColor(roleId: string, color: string) {
  emit('update-role', roleId, { color })
  showColorPickerFor.value = null
}
</script>

<template>
  <div class="role-manager">
    <div class="rm-header">
      <div class="rm-title-row">
        <Users class="w-4 h-4" />
        <h4 class="rm-title">排练角色</h4>
        <span class="rm-count">{{ roles.length }} 人</span>
      </div>
      <button
        v-if="!showAddForm"
        class="rm-add-btn"
        @click="showAddForm = true"
      >
        <UserPlus class="w-4 h-4" />
        新增
      </button>
    </div>

    <div v-if="showAddForm" class="rm-add-form">
      <input
        v-model="newRoleName"
        type="text"
        class="rm-input"
        placeholder="角色名称（如：赞礼、引宾…）"
        @keyup.enter="handleAddRole"
      />
      <input
        v-model="newRoleDesc"
        type="text"
        class="rm-input"
        placeholder="职责描述（可选）"
      />
      <div class="rm-form-actions">
        <button class="rm-btn-sm primary" @click="handleAddRole">
          <Check class="w-3 h-3" />
          确认
        </button>
        <button
          class="rm-btn-sm"
          @click="showAddForm = false; newRoleName = ''; newRoleDesc = ''"
        >
          <X class="w-3 h-3" />
          取消
        </button>
      </div>
    </div>

    <div class="rm-list">
      <div
        v-for="role in sortedRoles"
        :key="role.id"
        class="role-item"
        :class="{
          highlighted: highlightedRoleId === role.id,
        }"
      >
        <div class="role-left">
          <div
            class="role-color"
            :style="{ backgroundColor: role.color }"
            @click.stop="showColorPickerFor = showColorPickerFor === role.id ? null : role.id"
          >
            <Palette v-if="showColorPickerFor !== role.id" class="w-3 h-3" />
          </div>
          <div v-if="showColorPickerFor === role.id" class="color-picker-popover" @click.stop>
            <div
              v-for="color in DEFAULT_ROLE_COLORS"
              :key="color"
              class="color-dot"
              :style="{ backgroundColor: color }"
              :class="{ selected: color === role.color }"
              @click="selectColor(role.id, color)"
            />
          </div>

          <template v-if="editingRoleId === role.id">
            <div class="role-edit-form">
              <input
                v-model="editingRoleName"
                type="text"
                class="rm-input sm"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
              />
              <input
                v-model="editingRoleDesc"
                type="text"
                class="rm-input sm"
                placeholder="职责（可选）"
              />
              <div class="rm-form-actions">
                <button class="rm-btn-xs primary" @click="saveEdit">
                  <Check class="w-3 h-3" />
                </button>
                <button class="rm-btn-xs" @click="cancelEdit">
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="role-info">
              <div class="role-name" :style="{ color: role.color }">
                <span class="order-badge">{{ role.order }}</span>
                {{ role.name }}
              </div>
              <div v-if="role.description" class="role-desc">
                {{ role.description }}
              </div>
              <div class="role-meta">
                <span class="meta-tag">绑定 {{ getElementCountForRole(role.id) }} 项</span>
              </div>
            </div>
          </template>
        </div>

        <div class="role-right">
          <button
            class="rm-icon-btn"
            :title="highlightedRoleId === role.id ? '取消高亮' : '高亮该角色区域'"
            @click="toggleHighlight(role.id)"
          >
            <Eye v-if="highlightedRoleId !== role.id" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
          <button
            class="rm-icon-btn"
            :disabled="role.order <= 1"
            title="上移"
            @click="moveRoleUp(role)"
          >
            <ChevronUp class="w-4 h-4" />
          </button>
          <button
            class="rm-icon-btn"
            :disabled="role.order >= roles.length"
            title="下移"
            @click="moveRoleDown(role)"
          >
            <ChevronDown class="w-4 h-4" />
          </button>
          <button
            v-if="editingRoleId !== role.id"
            class="rm-icon-btn"
            title="编辑"
            @click.stop="startEdit(role)"
          >
            <Pencil class="w-4 h-4" />
          </button>
          <button
            class="rm-icon-btn danger"
            title="删除"
            @click="handleDelete(role.id)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="roles.length === 0" class="rm-empty">
        <Users class="w-8 h-8 empty-icon" />
        <p>暂无角色</p>
        <span>点击上方「新增」创建排练角色</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-manager {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.rm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
}

.rm-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5c3317;
}

.rm-title {
  font-size: 13px;
  font-weight: 600;
  color: #2C2C2C;
  margin: 0;
}

.rm-count {
  font-size: 11px;
  color: #999;
  background: rgba(139, 69, 19, 0.08);
  padding: 1px 8px;
  border-radius: 10px;
}

.rm-add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: rgba(95, 158, 160, 0.1);
  border: 1px solid rgba(95, 158, 160, 0.3);
  border-radius: 6px;
  font-size: 11px;
  color: #5F9EA0;
  cursor: pointer;
  transition: all 0.2s;
}

.rm-add-btn:hover {
  background: rgba(95, 158, 160, 0.2);
}

.rm-add-form {
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
  background: rgba(95, 158, 160, 0.04);
}

.rm-input {
  padding: 6px 10px;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 12px;
  background: #fdfaf4;
  outline: none;
  transition: border-color 0.2s;
}

.rm-input:focus {
  border-color: #5F9EA0;
}

.rm-input.sm {
  padding: 4px 8px;
  font-size: 11px;
}

.rm-form-actions {
  display: flex;
  gap: 6px;
}

.rm-btn-sm {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 6px;
  font-size: 11px;
  color: #5c3317;
  cursor: pointer;
}

.rm-btn-sm.primary {
  background: #5F9EA0;
  border-color: #5F9EA0;
  color: #fff;
}

.rm-btn-xs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 4px;
  color: #5c3317;
  cursor: pointer;
}

.rm-btn-xs.primary {
  background: #5F9EA0;
  border-color: #5F9EA0;
  color: #fff;
}

.rm-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px;
}

.role-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  position: relative;
}

.role-item:hover {
  background: rgba(139, 69, 19, 0.04);
}

.role-item.highlighted {
  background: rgba(95, 158, 160, 0.08);
  box-shadow: inset 0 0 0 2px rgba(95, 158, 160, 0.3);
}

.role-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
  position: relative;
}

.role-color {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.role-color:hover {
  transform: scale(1.1);
}

.color-picker-popover {
  position: absolute;
  top: 32px;
  left: 0;
  background: #fff;
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 8px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 20;
}

.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid transparent;
}

.color-dot:hover {
  transform: scale(1.15);
}

.color-dot.selected {
  border-color: #333;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-badge {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
  color: #8B4513;
}

.role-desc {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
  line-height: 1.4;
}

.role-meta {
  margin-top: 4px;
}

.meta-tag {
  font-size: 10px;
  background: rgba(139, 69, 19, 0.06);
  color: #8B4513;
  padding: 1px 6px;
  border-radius: 4px;
}

.role-edit-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.role-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.rm-icon-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.rm-icon-btn:hover:not(:disabled) {
  background: rgba(139, 69, 19, 0.08);
  color: #5c3317;
}

.rm-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.rm-icon-btn.danger:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.rm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 10px;
}

.rm-empty p {
  font-size: 13px;
  color: #888;
  margin: 0 0 4px 0;
}

.rm-empty span {
  font-size: 11px;
  color: #aaa;
}
</style>
