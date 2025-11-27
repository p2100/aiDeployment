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
            <img 
              v-for="(img, index) in materials" 
              :key="index"
              :src="img"
              class="material-item"
            />
          </div>
        </div>
      </div>

      <!-- LP URL -->
      <div class="detail-row">
        <div class="detail-label">lp url</div>
        <div class="detail-value">
          <a :href="detailData.lpUrl" target="_blank" class="link">
            {{ detailData.lpUrl }}
          </a>
        </div>
      </div>

      <!-- Headlines -->
      <div class="detail-row">
        <div class="detail-label">headlines</div>
        <div class="detail-value">
          <!-- 查看模式 -->
          <template v-if="mode === 'view'">
            <div v-for="(headline, index) in detailData.headlines" :key="index" class="text-item">
              {{ headline }}
            </div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <el-input
              v-for="(headline, index) in detailData.headlines"
              :key="index"
              v-model="detailData.headlines[index]"
              type="textarea"
              :rows="2"
              class="edit-textarea"
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
              {{ desc }}
            </div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <el-input
              v-for="(desc, index) in detailData.descriptions"
              :key="index"
              v-model="detailData.descriptions[index]"
              type="textarea"
              :rows="2"
              class="edit-textarea"
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
            <div class="text-item">{{ detailData.content }}</div>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <el-input
              v-model="detailData.content"
              type="textarea"
              :rows="4"
              placeholder="请输入内容"
            />
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
  headlines: [],
  descriptions: [],
  content: ''
})

// 素材列表（模拟多张图片）
const materials = computed(() => {
  if (props.imageData.url) {
    // 这里可以根据实际数据结构调整
    return [props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url, props.imageData.url]
  }
  return []
})

// 监听 imageData 变化，更新详情数据
watch(() => props.imageData, (newData) => {
  if (newData && newData.id) {
    detailData.value = {
      lpUrl: 'https://playtoys.tv/lp/colorful_ducks_and_animal_friends_1763985458893.html',
      headlines: [
        'Explore Toyland by Kids Videos',
        'Kid-Friendly Toy Video World',
        'Kids Playtime with Toy Videos',
        'Learn with Colorful Toy Videos',
        'Free Educational Toy Videos'
      ],
      descriptions: [
        'Explore Toyland with Kids Videos',
        'Online & Safe Playground of Toy Videos Just Designed for Kids Learning',
        'Play & Learn with Kids Toy Videos',
        'Best Toddler Learning Toy Video Online Site for Kids Learning',
        'Funny Playtime with Toy Videos for Kids'
      ],
      content: 'This is a sample content for the advertisement. It contains detailed information about the toy videos and educational materials for kids.'
    }
  }
}, { immediate: true })

const handleClose = () => {
  dialogVisible.value = false
}

const handleSave = () => {
  emit('save', detailData.value)
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
</style>

