<template>
  <el-aside width="380px" class="sidebar">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-button @click="selectAll" size="default">全选</el-button>
      
      <!-- 快速选择下拉框 -->
      <el-popover
        placement="bottom-start"
        :width="300"
        trigger="click"
      >
        <template #reference>
          <el-button type="primary" size="default">
            快速选择 <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
        </template>
        
        <!-- 筛选条件面板 -->
        <div class="filter-dropdown">
          <div class="filter-section">
            <div class="filter-label">language</div>
            <el-checkbox-group v-model="filters.language">
              <el-checkbox label="US">US</el-checkbox>
              <el-checkbox label="CN">CN</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="filter-section">
            <div class="filter-label">tag</div>
            <el-checkbox-group v-model="filters.tag">
              <el-checkbox label="animal">animal</el-checkbox>
              <el-checkbox label="nature">nature</el-checkbox>
              <el-checkbox label="food">food</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="filter-section">
            <div class="filter-label">designer_name</div>
            <el-checkbox-group v-model="filters.designer">
              <el-checkbox label="杜思颖">杜思颖</el-checkbox>
              <el-checkbox label="张三">张三</el-checkbox>
              <el-checkbox label="李四">李四</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 图片列表区域 -->
    <div class="image-list-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else class="image-list">
        <div 
          v-for="image in filteredMaterials" 
          :key="image.id"
          :class="['image-item', { selected: image.selected }]"
        >
          <img :src="image.url" :alt="image.tag" />
          
          <!-- 顶部标签和多选框 -->
          <div class="image-header">
            <el-checkbox 
              v-model="image.selected" 
              @change="onCheckboxChange"
              @click.stop
            />
            <div class="image-tags">
              <el-tag size="small" type="success">{{ image.tag }}</el-tag>
              <el-tag size="small" type="info">{{ image.language }}</el-tag>
            </div>
          </div>
          
          <!-- 悬浮操作按钮 -->
          <div class="hover-actions">
            <el-button size="small" @click.stop="editImage(image)">修改</el-button>
            <el-button size="small" @click.stop="viewImage(image)">查看</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <ImageDetailDialog 
      v-model="showDetailDialog"
      :mode="dialogMode"
      :image-data="currentImage"
      @save="handleSaveImage"
    />
  </el-aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import ImageDetailDialog from './ImageDetailDialog.vue'
import { useMaterial } from '@/composables'

// 使用素材管理 composable
const { 
  materials, 
  loading, 
  filters, 
  filteredMaterials,
  fetchMaterials, 
  getSelectedMaterials,
  toggleSelectAll,
  updateMaterial 
} = useMaterial()

// 对话框状态
const showDetailDialog = ref(false)
const dialogMode = ref('view') // 'view' 或 'edit'
const currentImage = ref({})

// 组件挂载时获取素材列表
onMounted(async () => {
  await fetchMaterials()
})

// 监听筛选条件变化
watch(filters, () => {
  // 可以在这里添加额外的筛选逻辑
}, { deep: true })

// 全选/取消全选
const selectAll = () => {
  toggleSelectAll()
}

// 多选框变化时的处理
const onCheckboxChange = () => {
  // 这里可以添加额外的逻辑
}

// 修改图片
const editImage = (image) => {
  currentImage.value = { ...image }
  dialogMode.value = 'edit'
  showDetailDialog.value = true
}

// 查看图片
const viewImage = (image) => {
  currentImage.value = { ...image }
  dialogMode.value = 'view'
  showDetailDialog.value = true
}

// 保存图片信息
const handleSaveImage = async (data) => {
  await updateMaterial(currentImage.value.id, data)
  showDetailDialog.value = false
}

// 获取选中的图片
const getSelectedImages = () => {
  return getSelectedMaterials()
}

// 获取选中的单元 IDs (对应 SP 项目)
const getSelectedUnitIds = () => {
  const selected = getSelectedMaterials()
  return selected.map(item => item._id || item.id)
}

// 创建 adUnitMap (对应 SP 项目)
const adUnitMap = computed(() => {
  const map = new Map()
  filteredMaterials.value.forEach(item => {
    const id = item._id || item.id
    map.set(id, {
      _id: id,
      project: item.project || '',
      language: item.language || '',
      tag: item.tag || '',
      designer_name: item.designer || item.designer_name || '',
      material_info: [{
        origin_square: [item.url],
        origin_long: [item.url],
        material_id: item.material_id || 0
      }],
      lp_url: item.lp_url || '',
      headlines: item.headlines || [],
      descriptions: item.descriptions || [],
      business_name: item.business_name || '',
      ad_name: item.ad_name || '',
      category: 'image'
    })
  })
  return map
})

// 刷新素材列表
const refreshMaterials = async () => {
  await fetchMaterials()
}

// 暴露方法和数据给父组件
defineExpose({
  getSelectedImages,
  getSelectedUnitIds,
  adUnitMap,
  refreshMaterials
})
</script>

<style scoped>
.sidebar {
  padding: 16px;
  border-right: 1px solid var(--el-border-color);
  background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;
}

.image-list-container {
  flex: 1;
  overflow: hidden;
}

.image-list {
  height: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-content: start;
  padding-right: 4px;
}

.image-item {
  position: relative;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  height: 150px;
}

.image-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.image-item.selected {
  border-color: #67c23a;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.4);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 顶部标签和多选框 */
.image-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}

.image-header :deep(.el-checkbox) {
  --el-checkbox-input-border-color-hover: #fff;
}

.image-header :deep(.el-checkbox__inner) {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.9);
}

.image-header :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.image-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 悬浮操作按钮 */
.hover-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 12px 8px 8px;
  display: flex;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .hover-actions {
  opacity: 1;
}

.hover-actions .el-button {
  font-size: 12px;
  padding: 4px 8px;
}

/* 筛选下拉框样式 */
.filter-dropdown {
  padding: 12px;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-section :deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.filter-section :deep(.el-checkbox) {
  margin-right: 0;
}

.filter-section :deep(.el-checkbox__label) {
  font-size: 13px;
}

.loading-container {
  padding: 20px;
}
</style>


