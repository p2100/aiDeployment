<template>
  <el-card class="campaign-card" shadow="hover">
    <!-- 卡片头部统计和删除按钮 -->
    <div class="card-header-row">
      <div class="card-stats">
        <span class="stat-item">素材: {{ materialCount }}</span>
        <span class="stat-item">campaignin: {{ campaignCount }}</span>
      </div>
      <el-button 
        type="danger" 
        circle 
        size="small" 
        @click="handleDelete"
        class="delete-btn"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 单独设置logo -->
      <div class="logo-section">
        <div class="section-label">
          单独设置logo 
          <el-icon class="help-icon"><QuestionFilled /></el-icon>:
        </div>
        <div class="logo-list">
          <div 
            v-for="logoId in data.logo_ids" 
            :key="logoId"
            class="logo-item"
          >
            <img :src="getLogoUrl(logoId)" alt="logo" />
            <el-icon class="logo-remove" @click="removeLogo(logoId)"><Close /></el-icon>
          </div>
          <div class="logo-add" @click="openLogoDialog">
            <el-icon><Plus /></el-icon>
          </div>
        </div>
      </div>

      <!-- 号召性文字 -->
      <div class="cta-section">
        <div class="cta-label-header">号召性文字:</div>
        <div class="cta-row">
          <el-select 
            v-model="data.call_to_action_text" 
            placeholder="Visit Site"
            size="small"
            style="width: 140px"
          >
            <el-option label="Visit Site" value="Visit Site" />
            <el-option label="Learn More" value="Learn More" />
            <el-option label="Shop Now" value="Shop Now" />
            <el-option label="Apply Now" value="Apply Now" />
          </el-select>
          <el-select 
            v-model="data.call_to_action_lang" 
            placeholder="BR"
            size="small"
            style="width: 100px"
          >
            <el-option label="US" value="US" />
            <el-option label="BR" value="BR" />
            <el-option label="CN" value="CN" />
            <el-option label="ES" value="ES" />
          </el-select>
          <el-button 
            type="danger"
            size="small" 
            circle
            @click="clearCtaOptions"
            title="清除"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
          <span class="cta-arrow">-></span>
          <span class="cta-translated">{{ getTranslatedCta }}</span>
          <el-link 
            type="primary" 
            :underline="false" 
            @click="syncCtaText"
            class="sync-link"
          >
            同步号召性文字
          </el-link>
        </div>
      </div>

      <!-- Campaign配置表格 -->
      <div class="config-table-section">
        <div class="section-header">
          <div class="section-label-row">
            <span class="section-label">campaign配置:</span>
          </div>
          <div class="header-actions">
            <el-link type="primary" :underline="false" size="small" @click="selectCampaignConfig">
              选择campaign
            </el-link>
            <el-link type="primary" :underline="false" size="small" @click="syncAllData">
              同步配置
            </el-link>
          <el-link type="danger" :underline="false" size="small" @click="toggleConfigTable">
            {{ configTableVisible ? '收起' : '展开' }}
          </el-link>
        </div>
      </div>
      <el-table 
        v-show="configTableVisible"
        :data="data.campaign_configs" 
        border 
        size="small"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        style="width: 100%; margin-top: 8px"
      >
          <el-table-column prop="campaign" label="campaign" width="120" />
          <el-table-column prop="cpa" label="cpa" width="100" />
          <el-table-column prop="custom_name" label="custom_name" min-width="150" />
          <el-table-column prop="url" label="url" min-width="150" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeConfigRow($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Campaign列表 -->
      <div class="campaigns-section">
        <div class="section-header">
          <span class="section-label">Campaign:</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="addCampaign">
              + Campaign
            </el-button>
            <el-dropdown @command="handleFillCommand" trigger="click">
              <el-button type="success" size="small">
                一键填充
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="template1">模板1</el-dropdown-item>
                  <el-dropdown-item command="template2">模板2</el-dropdown-item>
                  <el-dropdown-item command="template3">模板3</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" size="small" plain @click="clearAllCampaigns">
              一键清空
            </el-button>
            <el-button type="text" size="small" @click="handleCopy">
              <el-icon><DocumentCopy /></el-icon> copy
            </el-button>
            <el-button type="text" size="small" @click="handlePaste">
              <el-icon><Document /></el-icon> paste
            </el-button>
          </div>
        </div>

        <!-- Campaign展开列表 -->
        <div class="campaigns-list">
          <div 
            v-for="(campaign, cIndex) in data.campaigns"
            :key="cIndex"
            class="campaign-item"
          >
            <div class="campaign-header">
              <span class="campaign-title">campaign {{ cIndex + 1 }}</span>
              <div class="campaign-actions" @click.stop>
                <el-button 
                  type="danger" 
                  circle 
                  size="small" 
                  @click="removeCampaign(cIndex)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
                <el-button type="primary" size="small" @click="addAdGroup(cIndex)">
                  + AdGroup
                </el-button>
              </div>
            </div>

            <!-- AdGroup列表 -->
            <div v-show="!campaign.collapsed" class="ad-groups">
              <div 
                v-for="(adGroup, gIndex) in campaign.ad_groups"
                :key="gIndex"
                class="ad-group-item"
              >
                <div class="ad-group-header">
                  <span class="ad-group-name">adGroup_{{ adGroup.ad_group_name || gIndex }}</span>
                  <div class="ad-group-actions">
                    <el-button 
                      type="danger" 
                      circle 
                      size="small" 
                      @click="removeAdGroup(cIndex, gIndex)"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                    <el-link 
                      type="primary" 
                      :underline="false" 
                      @click="appendMaterials(cIndex, gIndex)"
                    >
                      追加单元
                    </el-link>
                  </div>
                </div>

                <!-- 素材缩略图 -->
                <div v-if="adGroup.ads && adGroup.ads.length > 0" class="materials-grid">
                  <div 
                    v-for="(ad, aIndex) in adGroup.ads"
                    :key="aIndex"
                    class="material-thumb"
                  >
                    <img :src="getMaterialImage(ad._id)" alt="素材" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logo选择对话框 -->
    <LogoSelectDialog
      v-model="logoDialogVisible"
      :selected-logos="data.logo_ids || []"
      @confirm="onLogoConfirm"
    />

    <!-- Campaign选择对话框 -->
    <CampaignSelectDialog
      v-model="campaignSelectDialogVisible"
      @confirm="onCampaignConfirm"
      @save-new="onSaveNewCampaign"
    />
  </el-card>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Close, 
  Delete,
  DocumentCopy, 
  Document, 
  QuestionFilled,
  ArrowDown
} from '@element-plus/icons-vue'
import LogoSelectDialog from './LogoSelectDialog.vue'
import CampaignSelectDialog from './CampaignSelectDialog.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  selectUnitIds: {
    type: Array,
    default: () => []
  },
  adUnitMap: {
    type: Map,
    default: () => new Map()
  }
})

const emit = defineEmits(['delete', 'clear-select'])

// 注入
const logoMap = inject('logoMap', () => ({}))
const copyCampaignData = inject('copyCampaignData', null)
const pasteCampaignData = inject('pasteCampaignData', null)
const syncCampaignConfig = inject('syncCampaignConfig', null)

// 对话框
const logoDialogVisible = ref(false)
const campaignSelectDialogVisible = ref(false)

// 配置表格展开/收起状态
const configTableVisible = ref(true)

// 统计
const materialCount = computed(() => {
  let count = 0
  props.data.campaigns?.forEach(campaign => {
    campaign.ad_groups?.forEach(adGroup => {
      count += adGroup.ads?.length || 0
    })
  })
  return count
})

const campaignCount = computed(() => {
  return props.data.campaigns?.length || 0
})

// Logo操作
const getLogoUrl = (logoId) => {
  return logoMap.value[logoId] || ''
}

const openLogoDialog = () => {
  logoDialogVisible.value = true
}

const onLogoConfirm = (logoIds) => {
  props.data.logo_ids = logoIds
  ElMessage.success(`已选择 ${logoIds.length} 个logo`)
}

const removeLogo = (logoId) => {
  const index = props.data.logo_ids.indexOf(logoId)
  if (index > -1) {
    props.data.logo_ids.splice(index, 1)
  }
}

// CTA操作
const ctaTranslations = {
  'Visit Site': {
    'US': 'Visit Site',
    'BR': 'Visitar site',
    'CN': '访问网站',
    'ES': 'Visitar sitio'
  },
  'Learn More': {
    'US': 'Learn More',
    'BR': 'Saiba mais',
    'CN': '了解更多',
    'ES': 'Más información'
  },
  'Shop Now': {
    'US': 'Shop Now',
    'BR': 'Compre agora',
    'CN': '立即购买',
    'ES': 'Compra ahora'
  },
  'Apply Now': {
    'US': 'Apply Now',
    'BR': 'Aplicar agora',
    'CN': '立即申请',
    'ES': 'Aplicar ahora'
  }
}

const getTranslatedCta = computed(() => {
  const text = props.data.call_to_action_text || 'Visit Site'
  const lang = props.data.call_to_action_lang || 'US'
  return ctaTranslations[text]?.[lang] || text
})

const copyCtaText = () => {
  const translated = getTranslatedCta.value
  navigator.clipboard.writeText(translated)
  ElMessage.success('已复制号召性文字')
}

const clearCtaOptions = () => {
  props.data.call_to_action_text = ''
  props.data.call_to_action_lang = ''
  ElMessage.success('已清除号召性文字')
}

const syncCtaText = () => {
  ElMessage.success('已同步号召性文字')
}

// Campaign配置
const selectCampaignConfig = () => {
  console.log('打开 Campaign 选择对话框')
  campaignSelectDialogVisible.value = true
  console.log('campaignSelectDialogVisible:', campaignSelectDialogVisible.value)
}

const onCampaignConfirm = (selectedCampaigns) => {
  const newConfigs = selectedCampaigns.map(camp => ({
    campaign: camp.campaig || 'campaign',
    cpa: camp.cpa || '0.2',
    custom_name: camp.name_suffi || '',
    url: camp.url_prefi || 'toyae'
  }))
  
  if (!props.data.campaign_configs) {
    props.data.campaign_configs = []
  }
  props.data.campaign_configs.push(...newConfigs)
  ElMessage.success(`已添加 ${selectedCampaigns.length} 个campaign配置`)
}

const onSaveNewCampaign = () => {
  ElMessage.info('新建campaign功能待实现')
}

const syncAllData = () => {
  if (syncCampaignConfig) {
    syncCampaignConfig(props.data, this)
    ElMessage.success('已同步所有配置到其他卡片')
  }
}

// 切换配置表格显示/隐藏
const toggleConfigTable = () => {
  configTableVisible.value = !configTableVisible.value
}

const removeConfigRow = (index) => {
  props.data.campaign_configs.splice(index, 1)
}

// Campaign操作
const addCampaign = () => {
  if (!props.data.campaigns) props.data.campaigns = []
  props.data.campaigns.push({ 
    ad_groups: [],
    collapsed: false
  })
}

const removeCampaign = (index) => {
  props.data.campaigns.splice(index, 1)
}

const clearAllCampaigns = () => {
  props.data.campaigns = []
  ElMessage.success('已清空所有Campaign')
}

const handleFillCommand = (command) => {
  ElMessage.info(`填充模板: ${command}`)
}

// AdGroup操作
const addAdGroup = (cIndex) => {
  if (!props.data.campaigns[cIndex].ad_groups) {
    props.data.campaigns[cIndex].ad_groups = []
  }
  props.data.campaigns[cIndex].ad_groups.push({
    ad_group_name: Date.now(),
    ads: []
  })
}

const removeAdGroup = (cIndex, gIndex) => {
  props.data.campaigns[cIndex].ad_groups.splice(gIndex, 1)
}

const appendMaterials = (cIndex, gIndex) => {
  if (!props.selectUnitIds || props.selectUnitIds.length === 0) {
    ElMessage.warning('请先在左侧选择素材')
    return
  }

  const ads = props.selectUnitIds.map(unitId => {
    const unit = props.adUnitMap.get(unitId)
    return {
      _id: unitId,
      tag: unit?.tag || '',
      language: unit?.language || ''
    }
  })

  props.data.campaigns[cIndex].ad_groups[gIndex].ads = ads
  ElMessage.success(`已添加 ${ads.length} 个素材`)
  emit('clear-select')
}

const getMaterialImage = (unitId) => {
  const unit = props.adUnitMap.get(unitId)
  return unit?.material_info?.[0]?.origin_square?.[0] || ''
}

// 复制粘贴
const handleCopy = () => {
  if (copyCampaignData) copyCampaignData(props.data)
}

const handlePaste = () => {
  if (pasteCampaignData) pasteCampaignData(props.data, this)
}

// 删除卡片
const handleDelete = () => {
  emit('delete', props.index)
}

const updateCampaignConfigs = (configs) => {
  props.data.campaign_configs = configs
}

const updateAllData = (newData) => {
  if (newData.campaigns) {
    props.data.campaigns = newData.campaigns
  }
  if (newData.campaign_configs) {
    props.data.campaign_configs = newData.campaign_configs
  }
  if (newData.logo_ids) {
    props.data.logo_ids = newData.logo_ids
  }
  if (newData.call_to_action_text !== undefined) {
    props.data.call_to_action_text = newData.call_to_action_text
  }
  if (newData.call_to_action_lang !== undefined) {
    props.data.call_to_action_lang = newData.call_to_action_lang
  }
}

defineExpose({ updateCampaignConfigs, updateAllData })
</script>

<style scoped lang="scss">
.campaign-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: #fafbfc;
  }
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #e8eaed;

  .card-stats {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #5f6368;

    .stat-item {
      font-weight: 600;
      padding: 4px 12px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .delete-btn {
    flex-shrink: 0;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: #202124;
  letter-spacing: -0.2px;
}

.help-icon {
  font-size: 14px;
  color: #80868b;
  cursor: help;
  transition: color 0.2s;

  &:hover {
    color: #5f6368;
  }
}

// CTA区域（放在 campaign 表格上方）
.cta-section {
  padding: 16px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5cc 100%);
  border-radius: 8px;
  border: 1px solid #ffe680;

  .cta-label-header {
    font-size: 15px;
    font-weight: 600;
    color: #202124;
    margin-bottom: 12px;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .cta-arrow {
      color: #80868b;
      font-size: 16px;
      margin: 0 4px;
      font-weight: 600;
    }

    .cta-translated {
      color: #1a73e8;
      font-size: 14px;
      font-weight: 600;
      padding: 6px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e8eaed;
    }

    .sync-link {
      margin-left: auto;
      font-weight: 500;
    }
  }
}

// Logo区域
.logo-section {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  transition: all 0.3s;

  &:hover {
    border-color: #dadce0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .logo-list {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    flex-wrap: wrap;

    .logo-item {
      position: relative;
      width: 40px;
      height: 40px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: visible;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

        .logo-remove {
          opacity: 1;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 3px;
      }

      .logo-remove {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 16px;
        height: 16px;
        background: #f56c6c;
        color: white;
        font-size: 10px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

        &:hover {
          background: #f23030;
          transform: scale(1.1);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .logo-add {
      width: 40px;
      height: 40px;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #909399;
      transition: all 0.3s;
      background: #fafafa;

      &:hover {
        border-color: #409eff;
        color: #409eff;
        background: #ecf5ff;
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// 配置表格
.config-table-section {
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 16px;
  background: white;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .section-label-row {
      display: flex;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-link {
        font-weight: 500;
      }
    }
  }

  :deep(.el-table) {
    font-size: 13px;
    border-radius: 4px;
    overflow: hidden;

    .el-table__header th {
      background: #f8f9fa !important;
      font-weight: 600;
    }
  }
}

// Campaign列表
.campaigns-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8eaed;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f1f3f4;

    .section-label {
      font-size: 15px;
      font-weight: 600;
      color: #202124;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
  }

  .campaigns-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.campaign-item {
  border: 2px solid #d2e3fc;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f4fd 0%, #d6ebff 100%);
  transition: all 0.3s;

  &:hover {
    border-color: #4285f4;
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
    transform: translateX(2px);
  }

  .campaign-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);

    .campaign-title {
      font-weight: 600;
      color: white;
      font-size: 14px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .campaign-actions {
      display: flex;
      gap: 8px;
      align-items: center;

      .el-button {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  .ad-groups {
    padding: 12px;
  }
}

.ad-group-item {
  margin-bottom: 10px;
  border: 2px solid #b7e5c2;
  border-radius: 8px;
  background: linear-gradient(135deg, #d4f4dd 0%, #c8f0d3 100%);
  overflow: hidden;
  transition: all 0.3s;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: #34a853;
    box-shadow: 0 4px 12px rgba(52, 168, 83, 0.15);
    transform: translateX(2px);
  }

  .ad-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: linear-gradient(135deg, #34a853 0%, #0f9d58 100%);

    .ad-group-name {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .ad-group-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      .el-button {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

      .el-link {
        color: white;
        font-weight: 600;

        &:hover {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  .materials-grid {
    display: flex;
    gap: 10px;
    padding: 12px;
    flex-wrap: wrap;

    .material-thumb {
      width: 80px;
      height: 80px;
      border: 2px solid white;
      border-radius: 6px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        border-color: #34a853;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>

