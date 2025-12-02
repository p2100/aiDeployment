<template>
  <div class="campaign-grid">
    <el-row :gutter="16">
      <el-col 
        v-for="(item, index) in campaignSets" 
        :key="item.id || item.__id"
        :xs="24" 
        :sm="24" 
        :md="12" 
        :lg="12"
      >
        <CampaignCard
          :ref="el => { if (el) cardRefs[index] = el }"
          :data="item"
          :index="index"
          :select-unit-ids="selectUnitIds"
          :ad-unit-map="adUnitMap"
          :site="site"
          :method="method"
          :account-user-info="accountUserInfo"
          :campaignConfigs="campaignConfigs"
          @delete="handleDelete"
          @clear-select="emit('clear-select')"
          @sync-cta="handleSyncCta"
        />
      </el-col>

      <!-- 新增卡片 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <div class="new-campaign-card" @click="handleAddNew">
          <el-icon class="add-icon" :size="80"><Plus /></el-icon>
          <div class="add-text">新增 Campaign</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import CampaignCard from './CampaignCard.vue'
import { indexApi } from "@api/index";
import axios from "axios";


const props = defineProps({
  campaignSets: {
    type: Array,
    default: () => []
  },
  selectUnitIds: {
    type: Array,
    default: () => []
  },
  adUnitMap: {
    type: Map,
    default: () => new Map()
  },
  site: {
    type: String,
    default: ''
  },
  method: {
    type: String,
    default: 'DC'
  },
  accountUserInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['add-new', 'delete', 'clear-select'])

const cardRefs = ref([])

const campaignConfigs = ref([])

// 获取 Campaign 配置
const getCampaignConfigs = async () => {
  if (!props.accountUserInfo || !props.site || !props.method) {
    return
  }
  
  try {
    const res = await indexApi.getCampaignConfigs({
      campaign_type: props.method,
      site: props.site,
      create_user: props.accountUserInfo.username
    })
    campaignConfigs.value = res.result || []
  } catch (error) {
    console.error('获取 Campaign 配置失败:', error)
    campaignConfigs.value = []
  }
}

// 监听 accountUserInfo 变化
watch(() => props.accountUserInfo, async (newVal) => {
  if (newVal) {
    await getCampaignConfigs()
  }
}, { immediate: true, deep: true })

// 监听 site 和 method 变化，重新获取配置
watch([() => props.site, () => props.method], async () => {
  if (props.accountUserInfo && props.site && props.method) {
    await getCampaignConfigs()
  }
})

// 组件挂载时获取配置
onMounted(() => {
  if (props.accountUserInfo && props.site && props.method) {
    getCampaignConfigs()
  }
})

const handleAddNew = () => {
  emit('add-new')
}

const handleDelete = (index) => {
  emit('delete', index)
}

// 同步配置到所有卡片
const syncConfigToAllCards = (sourceConfigs, sourceCardRef) => {
  cardRefs.value.forEach(cardRef => {
    if (cardRef && cardRef !== sourceCardRef && cardRef.updateCampaignConfigs) {
      cardRef.updateCampaignConfigs(JSON.parse(JSON.stringify(sourceConfigs)))
    }
  })
}

// 同步所有数据到其他卡片（包括campaigns）
const syncAllDataToOtherCards = (sourceData, sourceCardRef) => {
  cardRefs.value.forEach(cardRef => {
    if (cardRef && cardRef !== sourceCardRef && cardRef.updateAllData) {
      // 深拷贝所有数据
      const dataCopy = JSON.parse(JSON.stringify({
        campaigns: sourceData.campaigns || [],
        campaign_configs: sourceData.campaign_configs || [],
        logo_ids: sourceData.logo_ids || [],
        call_to_action_text: sourceData.call_to_action_text || '',
        call_to_action_lang: sourceData.call_to_action_lang || ''
      }))
      cardRef.updateAllData(dataCopy)
    }
  })
  ElMessage.success('已同步所有数据到其他卡片')
}

// 同步号召性文字到其他卡片
const handleSyncCta = (ctaData) => {
  const { call_to_action_text, call_to_action_lang, sourceIndex } = ctaData
  
  props.campaignSets.forEach((item, index) => {
    if (index !== sourceIndex) {
      item.call_to_action_text = call_to_action_text
      item.call_to_action_lang = call_to_action_lang
    }
  })
}

defineExpose({ syncConfigToAllCards, syncAllDataToOtherCards })
</script>

<style scoped lang="scss">
.campaign-grid {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
  // min-height: calc(100vh - 120px);
  // height: calc(100% - 56px);
  // height: 100%;

  :deep(.el-col) {
    margin-bottom: 20px;
  }
}

.new-campaign-card {
  min-height: 600px;
  border: 3px dashed #dadce0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(66, 133, 244, 0.1);
    transform: translate(-50%, -50%);
    transition: all 0.6s;
  }

  &:hover {
    border-color: #4285f4;
    background: linear-gradient(135deg, #e8f4fd 0%, #d2e3fc 100%);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(66, 133, 244, 0.2);

    &::before {
      width: 400px;
      height: 400px;
    }

    .add-icon {
      color: #4285f4;
      transform: scale(1.1) rotate(90deg);
    }

    .add-text {
      color: #1a73e8;
      transform: translateY(-4px);
    }
  }

  .add-icon {
    color: #80868b;
    transition: all 0.4s;
    z-index: 1;
  }

  .add-text {
    margin-top: 20px;
    font-size: 18px;
    font-weight: 600;
    color: #5f6368;
    transition: all 0.3s;
    z-index: 1;
  }
}
</style>

