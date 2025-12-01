<template>
  <el-dialog
    v-model="dialogVisible"
    title="广告详情"
    width="800px"
    append-to-body
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="detail-content">
      <!-- 素材展示 -->
      <div class="detail-row">
        <div class="detail-label">素材</div>
        <div class="detail-value">
          <div class="material-list">
            <papaya-image
              v-for="(img, index) in imageData.material_urls" 
              :src="img.url"
              :preview="[img.url]"
              fit="contain"
              width="auto"
              height= "100"
            ></papaya-image>
          </div>
        </div>
      </div>

      <!-- Headlines -->
      <div class="detail-row">
        <div class="detail-label">headlines</div>
        <div class="detail-value">
          <!-- 查看模式 -->
          <template v-if="mode === 'view'">
            <div v-for="(headline, index) in detailData.headlines" :key="index" class="text-item">
              {{ headline || '(空)' }}
            </div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <el-input
              v-for="(headline, index) in detailData.headlines"
              :key="index"
              v-model="detailData.headlines[index]"
              :placeholder="`headline ${index + 1}`"
              class="edit-input"
            />
          </template>
        </div>
      </div>

      <!-- Descriptions -->
      <div class="detail-row">
        <div class="detail-label">descriptions</div>
        <div class="detail-value">
          <!-- 查看模式 -->
          <template v-if="mode === 'view'">
            <div v-for="(desc, index) in detailData.descriptions" :key="index" class="text-item">
              {{ desc || '(空)' }}
            </div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <el-input
              v-for="(desc, index) in detailData.descriptions"
              :key="index"
              v-model="detailData.descriptions[index]"
              :placeholder="`description ${index + 1}`"
              class="edit-input"
            />
          </template>
        </div>
      </div>

      <!-- Content -->
      <div class="detail-row">
        <div class="detail-label">content</div>
        <div class="detail-value">
          <!-- 查看模式 -->
          <template v-if="mode === 'view'">
            <div v-for="(content, index) in detailData.content" :key="index" class="text-item">
              {{ content || '(空)' }}
            </div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <el-input
              v-for="(content, index) in detailData.content"
              :key="index"
              v-model="detailData.content[index]"
              :placeholder="`content ${index + 1}`"
              class="edit-input"
            />
          </template>
        </div>
      </div>

      <!-- Detail 选择 -->
      <div class="detail-row">
        <div class="detail-label">Detail</div>
        <div class="detail-value">
          <!-- 查看模式 -->
          <template v-if="mode === 'view'">
            <div v-if="detailData.detail && detailData.detail.length > 0">
              <div v-for="(item, index) in detailData.detail" :key="index">
                <div v-if="item.selected" class="selected-detail-item">
                  <div class="detail-header">
                    <el-text><strong>{{ item.payload?.title || `Detail ${index + 1}` }}</strong></el-text>
                    <el-tag size="small" type="success">Score: {{ item.score?.toFixed(4) || 'N/A' }}</el-tag>
                  </div>
                  <div v-if="item.payload" class="detail-payload">
                    <el-text type="info" size="small">
                      <strong>Tag:</strong> {{ item.payload.tag || 'N/A' }}<br/>
                      <strong>Description:</strong> {{ item.payload.description || 'N/A' }}<br/>
                      <strong>Video ID:</strong> {{ item.payload.video_id || 'N/A' }}<br/>
                      <strong>Type:</strong> {{ item.payload.type || 'N/A' }}
                    </el-text>
                  </div>
                </div>
              </div>
              <div v-if="!detailData.detail.some(item => item.selected)" class="text-item">
                <el-text type="info">未选择任何 Detail</el-text>
              </div>
            </div>
            <div v-else class="text-item">
              <el-text type="info">该素材没有 detail 数据</el-text>
            </div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <div v-if="detailData.detail && detailData.detail.length > 0" class="detail-list">
              <div
                v-for="(item, index) in detailData.detail"
                :key="index"
                class="detail-item"
                :class="{ 'detail-selected': item.selected }"
                @click="selectDetail(index)"
              >
                <div class="detail-header">
                  <el-checkbox
                    :model-value="item.selected"
                    @change="selectDetail(index)"
                  />
                  <span class="detail-title">{{ item.payload?.title || `Detail ${index + 1}` }}</span>
                  <el-tag size="small" type="info">Score: {{ item.score?.toFixed(4) || 'N/A' }}</el-tag>
                </div>
                <div v-if="item.payload" class="detail-content">
                  <el-text type="info" size="small">
                    <strong>Tag:</strong> {{ item.payload.tag || 'N/A' }}<br/>
                    <strong>Description:</strong> {{ item.payload.description || 'N/A' }}
                  </el-text>
                </div>
              </div>
            </div>
            <div v-else class="text-item">
              <el-text type="info">该素材没有 detail 数据</el-text>
            </div>
          </template>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="mode === 'edit'" type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PapayaImage from "@components/papaya-image.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'view', // 'view' 或 'edit'
    validator: (value) => ['view', 'edit'].includes(value)
  },
  imageData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 详情数据
const detailData = ref({
  lpUrl: '',
  headlines: ['', '', '', '', ''],
  descriptions: ['', '', '', '', ''],
  content: ['', '', '', '', '']
})

// 素材列表（模拟多张图片）
const materials = computed(() => {
  if (props.imageData.url) {
    // 这里可以根据实际数据结构调整
    return [props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url]
  }
  return []
})

// 选择 detail
const selectDetail = (index) => {
  if (!detailData.value.detail || !detailData.value.detail[index]) {
    return;
  }
  
  // 取消所有选中状态
  detailData.value.detail.forEach(item => {
    item.selected = false;
  });
  
  // 设置当前项为选中
  detailData.value.detail[index].selected = true;
};

// 初始化数组，确保有 5 个元素
const initArray = (arr, length = 5) => {
  if (!Array.isArray(arr)) {
    return Array(length).fill('')
  }
  const result = [...arr]
  while (result.length < length) {
    result.push('')
  }
  return result.slice(0, length)
}

// 监听 imageData 变化，更新详情数据
watch(() => props.imageData, (newData) => {
  if (newData) {
    // 使用实际的数据结构
    detailData.value = {
      lpUrl: newData.lp_url || '',
      headlines: initArray(newData.headlines, 5),
      descriptions: initArray(newData.descriptions, 5),
      content: initArray(newData.long_headlines || newData.content, 5),
      // 处理 detail，确保每项都有 selected 属性
      detail: newData.detail ? newData.detail.map((item, index) => ({
        ...item,
        selected: item.selected !== undefined ? item.selected : (index === 0) // 默认第一个被选中
      })) : []
    }
  }
}, { immediate: true, deep: true })

const handleClose = () => {
  dialogVisible.value = false
}

const handleSave = () => {
  // 保存时，更新原始数据
  const savedData = {
    ...props.imageData,
    headlines: detailData.value.headlines,
    descriptions: detailData.value.descriptions,
    long_headlines: detailData.value.content, // content 对应 long_headlines
    detail: detailData.value.detail
  }
  emit('save', savedData)
  handleClose()
}
</script>

<style scoped>
.detail-content {
  padding: 20px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 24px;
  gap: 16px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 120px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
  text-align: right;
  padding-top: 4px;
}

.detail-value {
  flex: 1;
  color: #303133;
}

.material-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.material-item {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e0e3eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.material-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.link {
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
}

.link:hover {
  text-decoration: underline;
}

.text-item {
  padding: 6px 0;
  line-height: 1.6;
  color: #606266;
}

.edit-input {
  margin-bottom: 12px;
}

.edit-input:last-child {
  margin-bottom: 0;
}

.edit-textarea {
  margin-bottom: 12px;
}

.edit-textarea:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-list {
  max-height: 400px;
  overflow-y: auto;
}

.detail-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    border-color: #409eff;
  }

  &.detail-selected {
    background: #ecf5ff;
    border-color: #409eff;
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .detail-title {
      flex: 1;
      font-weight: 600;
    }
  }

  .detail-content {
    margin-top: 8px;
    padding-left: 24px;
  }
}

.selected-detail-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 4px;

  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .detail-payload {
    margin-top: 8px;
    padding-left: 8px;
    line-height: 1.8;
  }
}
</style>

