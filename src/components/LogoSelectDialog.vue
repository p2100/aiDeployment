<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择logo"
    width="800px"
    append-to-body
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="logo-select-content">
      <div class="logo-actions">
        <el-button size="small" type="primary" @click="handleUpload">上传</el-button>
      </div>
      
      <div class="logo-grid">
        <div 
          v-for="logo in logos" 
          :key="logo.id"
          :class="['logo-item', { selected: isSelected(logo.id) }]"
          @click="toggleSelect(logo.id)"
        >
          <el-checkbox 
            :model-value="isSelected(logo.id)"
            @click.stop
            @change="toggleSelect(logo.id)"
            class="logo-checkbox"
          />
          <img :src="logo.url" :alt="logo.name" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedLogos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Logo 列表数据
const logos = ref([
  { id: 1, name: 'Logo 1', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
  { id: 2, name: 'Logo 2', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
  { id: 3, name: 'Logo 3', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
  { id: 4, name: 'Logo 4', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
  { id: 5, name: 'Logo 5', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
  { id: 6, name: 'Logo 6', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
  { id: 7, name: 'Logo 7', url: 'https://img2.baidu.com/it/u=2612741288,182099192&fm=253&fmt=auto&app=138&f=JPEG?w=513&h=500' },
])

// 当前选中的 logo IDs
const selectedIds = ref([...props.selectedLogos])

// 判断是否选中
const isSelected = (id) => {
  return selectedIds.value.includes(id)
}

// 切换选中状态
const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 上传
const handleUpload = () => {
  console.log('上传 logo')
  // 这里可以添加上传逻辑
}

// 关闭
const handleClose = () => {
  dialogVisible.value = false
}

// 确认
const handleConfirm = () => {
  emit('confirm', selectedIds.value)
  handleClose()
}
</script>

<style scoped>
.logo-select-content {
  padding: 20px 0;
}

.logo-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.logo-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px solid #e0e3eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.logo-item.selected {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.5);
  background-color: #ecf5ff;
}

.logo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-checkbox {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 10;
}

.logo-checkbox :deep(.el-checkbox__inner) {
  background-color: rgba(255, 255, 255, 0.9);
}

.logo-item.selected .logo-checkbox :deep(.el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>

