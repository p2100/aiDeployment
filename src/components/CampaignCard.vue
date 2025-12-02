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
          <div v-for="logoId in data.logo_ids" :key="logoId" class="logo-item">
            <papaya-image
              :src="`https://static.spga.xyz/${logoId}`"
              :preview="[`https://static.spga.xyz/${logoId}`]"
              fit="contain"
              width="40"
              height="40"
            ></papaya-image>
            <el-icon class="logo-remove" @click="removeLogo(logoId)"
              ><Close
            /></el-icon>
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
            size="small"
            style="width: 140px"
          >
            <el-option v-for="key in ActionKeys" :value="key">
              {{ key }}
            </el-option>
          </el-select>
          <el-select
            v-model="data.call_to_action_lang"
            size="small"
            style="width: 100px"
          >
            <el-option v-for="key in Object.keys(ActionMap)" :value="key">
              {{ key }}
            </el-option>
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
          <span v-if="data.call_to_action_text && data.call_to_action_lang" class="cta-arrow">-></span>
          <span v-if="data.call_to_action_text && data.call_to_action_lang" class="cta-translated">{{ getTranslatedCta }}</span>
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
            <span class="section-label">Campaign 配置</span>
          </div>
          <div class="header-actions">
            <el-link
              type="primary"
              :underline="false"
              size="small"
              @click="selectCampaignConfig"
            >
              选择campaign
            </el-link>
            <el-link
              type="primary"
              :underline="false"
              size="small"
              @click="syncAllData"
            >
              同步配置
            </el-link>
            <el-link
              type="danger"
              :underline="false"
              size="small"
              @click="toggleConfigTable"
            >
              {{ configTableVisible ? "收起" : "展开" }}
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
          <el-table-column prop="site" label="Site" width="100" align="center" />
          <el-table-column prop="campaign" label="Campaign" width="120" align="center" />
          <el-table-column prop="country" label="Country" width="100" align="center" />
          <el-table-column prop="cpa" label="CPA" width="100" align="center" />
          <el-table-column prop="budget" label="Budget" width="100" align="center" />
          <el-table-column prop="schedule" label="Schedule" min-width="200" align="center">
            <template #default="{ row }">
              {{ formatSchedule(row.schedule) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                link
                size="small"
                @click="removeConfigRow($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div style="text-align: center; padding: 20px; color: #909399;">
              暂无配置数据
            </div>
          </template>
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
            <el-dropdown @command="handleFillCommand" trigger="hover" @visible-change="onDropdownVisibleChange">
              <el-button type="success" size="small" :loading="templateLoading">
                一键填充
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="template in templateList"
                    :key="template.id || template._id"
                    :command="template.id || template._id"
                    :disabled="getTemplateDisabled(template)"
                  >
                    <el-tooltip
                      v-if="getTemplateTooltip(template)"
                      :content="getTemplateTooltip(template)"
                      placement="left"
                    >
                      <span>{{ template.name || template.template_name || `模板 ${template.id || template._id}` }}</span>
                    </el-tooltip>
                    <span v-else>{{ template.name || template.template_name || `模板 ${template.id || template._id}` }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="templateList.length === 0 && !templateLoading" disabled>
                    暂无模板
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              type="danger"
              size="small"
              plain
              @click="clearAllCampaigns"
            >
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
                <el-button
                  type="primary"
                  size="small"
                  @click="addAdGroup(cIndex)"
                >
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
                  <span class="ad-group-name"
                    >adGroup_{{ adGroup.ad_group_name || gIndex }}</span
                  >
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
                <div
                  v-if="adGroup.ads && adGroup.ads.length > 0"
                  class="materials-grid"
                >
                  <div
                    v-for="(ad, aIndex) in adGroup.ads"
                    :key="aIndex"
                    class="material-thumb"
                  >
                    <img :src="getMaterialImage(ad)" alt="素材" />
                    <div class="material-actions">
                      <el-button
                        type="primary"
                        circle
                        size="small"
                        @click="openEditMaterialDialog(cIndex, gIndex, aIndex)"
                        title="编辑"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="info"
                        circle
                        size="small"
                        @click="openViewMaterialDialog(ad)"
                        title="查看"
                      >
                        <el-icon><View /></el-icon>
                      </el-button>
                    </div>
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
      :site="props.site"
      @confirm="onLogoConfirm"
    />

    <!-- Campaign选择对话框 -->
    <CampaignSelectDialog
      v-model="campaignSelectDialogVisible"
      :campaignConfigs="campaignConfigs"
      @confirm="onCampaignConfirm"
    />

    <!-- 素材编辑对话框 -->
    <ImageDetailDialog
      v-model="materialEditDialogVisible"
      mode="edit"
      :image-data="editingMaterial"
      @save="handleMaterialSave"
    />

    <!-- 素材查看对话框 -->
    <ImageDetailDialog
      v-model="materialViewDialogVisible"
      mode="view"
      :image-data="viewingMaterial"
    />
  </el-card>
</template>

<script setup>
import { ref, computed, inject, watch } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import {
  Plus,
  Close,
  Delete,
  DocumentCopy,
  Document,
  QuestionFilled,
  ArrowDown,
  Edit,
  View,
} from "@element-plus/icons-vue";
import LogoSelectDialog from "./LogoSelectDialog.vue";
import CampaignSelectDialog from "@components/CampaignSelectDialog.vue";
import ImageDetailDialog from "@components/ImageDetailDialog.vue";
import PapayaImage from "@components/papaya-image.vue";
import { indexApi } from "@api/index";
import { ActionKeys, ActionMap } from "@utils/call-to-action";
import { CAMPAIGN_TEMPLATE } from "@utils/const";
import { CampaignType } from "@types/campaign";
import dayjs from "dayjs";
import axios from "axios";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  selectUnitIds: {
    type: Array,
    default: () => [],
  },
  adUnitMap: {
    type: Map,
    default: () => new Map(),
  },
  campaignConfigs: {
    type: Array,
    default: () => [],
  },
  site: {
    type: String,
    default: '',
  },
  method: {
    type: String,
    default: 'DC',
  },
  accountUserInfo: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["delete", "clear-select", "sync-cta"]);

// 注入
const logoMap = inject("logoMap", () => ({}));
const copyCampaignData = inject("copyCampaignData", null);
const pasteCampaignData = inject("pasteCampaignData", null);
const syncCampaignConfig = inject("syncCampaignConfig", null);

// 对话框
const logoDialogVisible = ref(false);
const campaignSelectDialogVisible = ref(false);
const detailSelectDialogVisible = ref(false);
const detailSelectData = ref(null); // 当前选择 detail 的数据
const detailSelectCallback = ref(null); // 选择完成后的回调函数
const selectedDetailIndex = ref(0); // 选中的 detail 索引

// 素材编辑和查看对话框
const materialEditDialogVisible = ref(false);
const materialViewDialogVisible = ref(false);
const editingMaterial = ref(null);
const viewingMaterial = ref(null);
const editingMaterialIndex = ref({ cIndex: -1, gIndex: -1, aIndex: -1 });

// 配置表格展开/收起状态
const configTableVisible = ref(true);

// 模板列表
const templateList = ref([]);
const templateLoading = ref(false);

// 统计
const materialCount = computed(() => {
  let count = 0;
  props.data.campaigns?.forEach((campaign) => {
    campaign.ad_groups?.forEach((adGroup) => {
      count += adGroup.ads?.length || 0;
    });
  });
  return count;
});

const campaignCount = computed(() => {
  return props.data.campaigns?.length || 0;
});

// Logo操作
const getLogoUrl = (logoId) => {
  return logoMap.value[logoId] || "";
};

const openLogoDialog = () => {
  logoDialogVisible.value = true;
};

const onLogoConfirm = (logoIds) => {
  props.data.logo_ids = logoIds;
  ElMessage.success(`已选择 ${logoIds.length} 个logo`);
};

const removeLogo = (logoId) => {
  const index = props.data.logo_ids.indexOf(logoId);
  if (index > -1) {
    props.data.logo_ids.splice(index, 1);
  }
};

// CTA操作
const ctaTranslations = {
  "Visit Site": {
    US: "Visit Site",
    BR: "Visitar site",
    CN: "访问网站",
    ES: "Visitar sitio",
  },
  "Learn More": {
    US: "Learn More",
    BR: "Saiba mais",
    CN: "了解更多",
    ES: "Más información",
  },
  "Shop Now": {
    US: "Shop Now",
    BR: "Compre agora",
    CN: "立即购买",
    ES: "Compra ahora",
  },
  "Apply Now": {
    US: "Apply Now",
    BR: "Aplicar agora",
    CN: "立即申请",
    ES: "Aplicar ahora",
  },
};

const getTranslatedCta = computed(() => {
  const text = props.data.call_to_action_text || "";
  const lang = props.data.call_to_action_lang || "";
  return ctaTranslations[text]?.[lang] || text;
});

const copyCtaText = () => {
  const translated = getTranslatedCta.value;
  navigator.clipboard.writeText(translated);
  ElMessage.success("已复制号召性文字");
};

const clearCtaOptions = () => {
  props.data.call_to_action_text = "";
  props.data.call_to_action_lang = "";
  ElMessage.success("已清除号召性文字");
};

const syncCtaText = () => {
  emit("sync-cta", {
    call_to_action_text: props.data.call_to_action_text,
    call_to_action_lang: props.data.call_to_action_lang,
    sourceIndex: props.index
  });
  ElMessage.success("已同步号召性文字到其他卡片");
};

// Campaign配置
const selectCampaignConfig = () => {
  console.log("打开 Campaign 选择对话框");
  campaignSelectDialogVisible.value = true;
  console.log(
    "campaignSelectDialogVisible:",
    campaignSelectDialogVisible.value
  );
};

const onCampaignConfirm = (selectedCampaigns) => {
  // 保留所有原始数据字段，只添加 site 字段
  const newConfigs = selectedCampaigns.map((camp) => ({
    ...camp, // 保留所有原始字段
    // site: props.site || "", // 添加 site 字段
    // 为了兼容性，保留 campaign 字段（从 name_loc 或 campaig 获取）
    campaign: camp.name_loc || camp.campaig || camp.campaign || "campaign",
  }));

  if (!props.data.campaign_configs) {
    props.data.campaign_configs = [];
  }
  props.data.campaign_configs.push(...newConfigs);
  ElMessage.success(`已添加 ${selectedCampaigns.length} 个campaign配置`);
};

const onSaveNewCampaign = () => {
  ElMessage.info("新建campaign功能待实现");
};

const syncAllData = () => {
  if (syncCampaignConfig) {
    syncCampaignConfig(props.data, this);
    ElMessage.success("已同步所有配置到其他卡片");
  }
};

// 切换配置表格显示/隐藏
const toggleConfigTable = () => {
  configTableVisible.value = !configTableVisible.value;
};

const removeConfigRow = (index) => {
  props.data.campaign_configs.splice(index, 1);
};

// 格式化时间（补零）
const formatTime = (hour, minute) => {
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return `${h}:${m}`
}

// 格式化 schedule 显示
const formatSchedule = (schedule) => {
  if (!schedule) return ''
  
  // 如果是数组
  if (Array.isArray(schedule) && schedule.length > 0) {
    return schedule.map(item => {
      const startTime = formatTime(item.start_hour || 0, item.start_minute || 0)
      const endTime = formatTime(item.end_hour || 0, item.end_minute || 0)
      return `${startTime} - ${endTime}`
    }).join(', ')
  }
  
  // 如果是对象
  if (typeof schedule === 'object' && schedule.start_hour !== undefined) {
    const startTime = formatTime(schedule.start_hour || 0, schedule.start_minute || 0)
    const endTime = formatTime(schedule.end_hour || 0, schedule.end_minute || 0)
    return `${startTime} - ${endTime}`
  }
  
  return ''
}

// Campaign操作
const addCampaign = () => {
  if (!props.data.campaigns) props.data.campaigns = [];
  props.data.campaigns.push({
    ad_groups: [],
    collapsed: false,
  });
};

const removeCampaign = (index) => {
  props.data.campaigns.splice(index, 1);
};

const clearAllCampaigns = () => {
  props.data.campaigns = [];
  ElMessage.success("已清空所有Campaign");
};

// 获取模板列表（参考 sp 项目：合并本地模板和远程模板）
const getTemplateList = async () => {
  templateLoading.value = true;
  try {
    // 获取远程模板
    const res = await indexApi.getCampaignTemplateList();
    const remoteTemplates = res.result?.data || res.result || [];
    
    // 处理本地模板：添加 reqNum 和 _id（参考 sp 项目）
    const localTemplates = CAMPAIGN_TEMPLATE.map((temp, index) => ({
      ...temp,
      reqNum: temp.reqNum || Math.max(...temp.template.flat()) + 1,
      _id: `sys_campaign_${index}`,
    }));
    
    // 处理远程模板：确保有 reqNum
    const processedRemoteTemplates = remoteTemplates.map((temp) => ({
      ...temp,
      reqNum: temp.reqNum || (temp.template && Array.isArray(temp.template) 
        ? Math.max(...temp.template.flat()) + 1 
        : 0),
    }));
    
    // 合并本地模板和远程模板（参考 sp 项目）
    const allTemplates = [...localTemplates, ...processedRemoteTemplates];
    
    // 根据 method（对应 campaignType）过滤模板（参考 sp 项目）
    // method 值直接对应 CampaignType（"DC" -> CampaignType.DC, "PMAX" -> CampaignType.PM）
    const currentCampaignType = props.method === 'PMAX' ? CampaignType.PM : (props.method || CampaignType.DC);
    templateList.value = allTemplates.filter((template) => {
      // 如果模板有 campaigns 数据（旧版本），不过滤
      if (template.campaigns && Array.isArray(template.campaigns)) {
        return true;
      }
      // 新版本：根据 allowCampaignType 过滤
      return template.allowCampaignType?.includes(currentCampaignType) ?? true;
    });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    ElMessage.error('获取模板列表失败');
    // 即使 API 失败，也使用本地模板
    const localTemplates = CAMPAIGN_TEMPLATE.map((temp, index) => ({
      ...temp,
      reqNum: temp.reqNum || Math.max(...temp.template.flat()) + 1,
      _id: `sys_campaign_${index}`,
    }));
    // method 值直接对应 CampaignType
    const currentCampaignType = props.method === 'PMAX' ? CampaignType.PM : (props.method || CampaignType.DC);
    templateList.value = localTemplates.filter((template) => {
      return template.allowCampaignType?.includes(currentCampaignType) ?? true;
    });
  } finally {
    templateLoading.value = false;
  }
};

// 下拉菜单显示/隐藏时获取模板列表（只加载一次）
const onDropdownVisibleChange = (visible) => {
  if (visible) {
    getTemplateList();
  }
};

// 监听站点和投放方式变化，清空模板列表
watch([() => props.site, () => props.method], () => {
  templateList.value = [];
});

// 获取模板的 reqNum（参考 sp 项目：如果没有提供，自动计算）
const getTemplateReqNum = (template) => {
  // 如果模板有 campaigns 数据（旧版本），返回 0（不禁用）
  if (template.campaigns && Array.isArray(template.campaigns)) {
    return 0;
  }
  // 新版本：如果有 reqNum 则使用，否则从 template 中计算
  if (template.reqNum !== undefined && template.reqNum !== null) {
    return template.reqNum;
  }
  // 自动计算 reqNum（与 sp 项目一致）
  if (template.template && Array.isArray(template.template)) {
    let maxIndex = -1;
    template.template.forEach(adGroupTemplate => {
      if (Array.isArray(adGroupTemplate)) {
        adGroupTemplate.forEach(index => {
          if (index > maxIndex) {
            maxIndex = index;
          }
        });
      }
    });
    return maxIndex + 1;
  }
  return 0;
};

// 判断模板是否应该禁用（与 sp 项目一致）
const getTemplateDisabled = (template) => {
  // 如果模板有 campaigns 数据（旧版本），不禁用
  if (template.campaigns && Array.isArray(template.campaigns)) {
    return false;
  }
  // 新版本：检查选中的单元数量是否满足要求
  const reqNum = getTemplateReqNum(template);
  // 如果 reqNum 为 0，说明模板格式不正确，禁用
  if (reqNum === 0) {
    return true;
  }
  return (props.selectUnitIds?.length || 0) < reqNum;
};

// 获取模板的提示信息
const getTemplateTooltip = (template) => {
  // 如果模板有 campaigns 数据（旧版本），不显示提示
  if (template.campaigns && Array.isArray(template.campaigns)) {
    return null;
  }
  const reqNum = getTemplateReqNum(template);
  const selNum = props.selectUnitIds?.length || 0;
  
  if (selNum < reqNum) {
    return `该模板需要至少 ${reqNum} 个素材，但当前仅选择 ${selNum} 个，无法填充`;
  }
  
  const ignoreNum = selNum % reqNum;
  const campNum = (selNum - ignoreNum) / reqNum;
  
  if (ignoreNum === 0) {
    return `当前选项可组装 ${campNum} 个 Campaign`;
  } else {
    return `该模板需要 ${reqNum} 个素材为一组，但当前选择 ${selNum} 个，将组装 ${campNum} 个 Campaign，多余 ${ignoreNum} 个素材将被忽略`;
  }
};

// 获取默认 AdGroup 名称
const getDefaultAdGroupName = (startUnit, batchIndex) => {
  const suffix = batchIndex !== undefined ? `_${batchIndex + 1}` : "";
  if (startUnit) {
    const createTime = startUnit.create_time || startUnit.createTime || new Date();
    const materialId = startUnit.material_ids?.[0] || startUnit.material_id || Date.now();
    const tag = startUnit.tag || "";
    const designerUsername = startUnit.designer_username || startUnit.designer_name || "user";
    return `${designerUsername}_${dayjs(createTime).format("YYYYMMDD")}_${materialId}_${tag}${suffix}`;
  }
  return `adGroup_${Date.now()}${suffix}`;
};

// 填充模板数据 - 参考 sp 项目的实现
const handleFillCommand = async (templateId) => {
  try {
    const template = templateList.value.find(
      (t) => (t.id || t._id) === templateId
    );

    if (!template) {
      ElMessage.error('模板不存在');
      return;
    }

    // 如果模板有 campaigns 数据（旧版本兼容），直接填充
    if (template.campaigns && Array.isArray(template.campaigns)) {
      props.data.campaigns = JSON.parse(JSON.stringify(template.campaigns));
      if (template.campaign_configs) {
        props.data.campaign_configs = JSON.parse(JSON.stringify(template.campaign_configs));
      }
      if (template.logo_ids) {
        props.data.logo_ids = JSON.parse(JSON.stringify(template.logo_ids));
      }
      if (template.call_to_action_text !== undefined) {
        props.data.call_to_action_text = template.call_to_action_text;
      }
      if (template.call_to_action_lang !== undefined) {
        props.data.call_to_action_lang = template.call_to_action_lang;
      }
      ElMessage.success('模板填充成功');
      return;
    }

    // 新版本：根据模板的 template 和 reqNum 来填充（参考 sp 项目，逻辑完全一致）
    // 检查是否有 template 字段（二维数组）
    if (!template.template || !Array.isArray(template.template)) {
      ElMessage.error('模板格式不正确，缺少 template 字段');
      return;
    }

    // reqNum 计算逻辑（与 sp 项目一致：如果没有提供，自动计算）
    const uNum = template.reqNum || (() => {
      // 从 template 中获取最大值 + 1（与 sp 项目一致）
      let maxIndex = -1;
      template.template.forEach(adGroupTemplate => {
        if (Array.isArray(adGroupTemplate)) {
          adGroupTemplate.forEach(index => {
            if (index > maxIndex) {
              maxIndex = index;
            }
          });
        }
      });
      return maxIndex + 1;
    })();

    // 检查选中的单元数量是否满足模板要求（与 sp 项目一致）
    // selectUnitIds 可能是完整数据对象数组或 id 数组
    const selectUnitIdsLength = props.selectUnitIds?.length || 0;
    if (selectUnitIdsLength < uNum) {
      ElNotification.error(`该模板需要${uNum}个广告单元进行组装`);
      return;
    }

    // 计算余数和可创建的 campaign 数量（与 sp 项目一致）
    const ignoreNum = selectUnitIdsLength % uNum;
    if (ignoreNum > 0) {
      ElNotification.error(
        `该模板需要${uNum}个广告单元进行组装，已自动忽略后选的${ignoreNum}个广告单元`,
      );
    }

    const times = (selectUnitIdsLength - ignoreNum) / uNum;

    // 根据模板创建 campaigns（追加到现有 campaigns，不清空 - 与 sp 项目一致）
    for (let i = 0; i < times; i++) {
      const startIndex = i * uNum;

      // 根据模板的 template 数组创建 ad_groups（与 sp 项目逻辑完全一致）
      const adGroups = template.template.map((ads, agIndex) => {
        // ads 是一个数组，表示该 adGroup 中应该包含哪些索引的单元
        // 获取第一个单元用于生成名称（与 sp 项目一致）
        // 如果 selectUnitIds 是完整数据对象，直接使用；否则从 adUnitMap 获取
        const firstItem = ads.length > 0 ? props.selectUnitIds[startIndex + ads[0]] : null;
        const firstUnit = firstItem 
          ? (typeof firstItem === 'object' && firstItem !== null 
              ? firstItem 
              : props.adUnitMap.get(firstItem))
          : undefined;

        // 创建 ads 数组（完整数据对象数组，包含选中的 detail）
        // 如果 selectUnitIds 是完整数据对象，保留完整对象并添加选中的 detail；如果是 id，从 adUnitMap 获取
        const adsArray = ads.map((index) => {
          const item = props.selectUnitIds[startIndex + index];
          let material;
          
          // 如果是对象，直接使用
          if (typeof item === 'object' && item !== null) {
            material = item;
          } else {
            // 如果是字符串（id），从 adUnitMap 获取完整数据
            material = props.adUnitMap.get(item) || item;
          }
          
          // 处理 material，为 detail 添加 selected 属性（默认第一个被选中）
          return processMaterialWithDetail(material);
        });

        return {
          ad_group_name: getDefaultAdGroupName(firstUnit, agIndex),
          ads: adsArray,
        };
      });

      props.data.campaigns.push({
        __templateId: template._id || template.id,
        ad_groups: adGroups,
        collapsed: false,
      });
    }

    // 清空选中的单元（与 sp 项目一致）
    emit("clear-select");
  } catch (error) {
    console.error('填充模板失败:', error);
    ElMessage.error('填充模板失败: ' + (error.message || '未知错误'));
  }
};

// AdGroup操作
const addAdGroup = (cIndex) => {
  if (!props.data.campaigns[cIndex].ad_groups) {
    props.data.campaigns[cIndex].ad_groups = [];
  }
  props.data.campaigns[cIndex].ad_groups.push({
    ad_group_name: Date.now(),
    ads: [],
  });
};

const removeAdGroup = (cIndex, gIndex) => {
  props.data.campaigns[cIndex].ad_groups.splice(gIndex, 1);
};

// 处理单个素材，初始化 detail 的 selected 属性（默认第一个被选中）
const processMaterialWithDetail = (material) => {
  if (typeof material !== 'object' || material === null) {
    return material;
  }
  
  // 创建新的对象，为 detail 添加 selected 属性
  const processedMaterial = {
    ...material,
    detail: material.detail ? material.detail.map((item, index) => ({
      ...item,
      selected: index === 0 // 默认第一个被选中
    })) : []
  };
  
  return processedMaterial;
};

// 打开素材编辑对话框
const openEditMaterialDialog = (cIndex, gIndex, aIndex) => {
  const material = props.data.campaigns[cIndex].ad_groups[gIndex].ads[aIndex];
  if (!material) {
    ElMessage.warning('素材不存在');
    return;
  }
  
  // 确保 detail 有 selected 属性
  const materialWithDetail = {
    ...material,
    detail: material.detail ? material.detail.map((item, index) => ({
      ...item,
      selected: item.selected !== undefined ? item.selected : (index === 0)
    })) : []
  };
  
  editingMaterial.value = JSON.parse(JSON.stringify(materialWithDetail));
  editingMaterialIndex.value = { cIndex, gIndex, aIndex };
  materialEditDialogVisible.value = true;
};

// 处理素材保存
const handleMaterialSave = (savedData) => {
  if (!editingMaterialIndex.value || editingMaterialIndex.value.cIndex === -1) {
    return;
  }
  
  const { cIndex, gIndex, aIndex } = editingMaterialIndex.value;
  props.data.campaigns[cIndex].ad_groups[gIndex].ads[aIndex] = savedData;
  
  ElMessage.success('素材已更新');
  materialEditDialogVisible.value = false;
  editingMaterial.value = null;
  editingMaterialIndex.value = { cIndex: -1, gIndex: -1, aIndex: -1 };
};

// 打开素材查看对话框
const openViewMaterialDialog = (material) => {
  // 确保 detail 有 selected 属性
  const materialWithDetail = {
    ...material,
    detail: material.detail ? material.detail.map((item, index) => ({
      ...item,
      selected: item.selected !== undefined ? item.selected : (index === 0)
    })) : []
  };
  
  viewingMaterial.value = materialWithDetail;
  materialViewDialogVisible.value = true;
};

const appendMaterials = (cIndex, gIndex) => {
  if (!props.selectUnitIds || props.selectUnitIds.length === 0) {
    ElMessage.warning("请先在左侧选择素材");
    return;
  }

  // 确保 ad_groups 和 ads 数组存在
  if (!props.data.campaigns[cIndex].ad_groups) {
    props.data.campaigns[cIndex].ad_groups = [];
  }
  if (!props.data.campaigns[cIndex].ad_groups[gIndex]) {
    props.data.campaigns[cIndex].ad_groups[gIndex] = {
      ad_group_name: Date.now(),
      ads: [],
    };
  }
  if (!props.data.campaigns[cIndex].ad_groups[gIndex].ads) {
    props.data.campaigns[cIndex].ad_groups[gIndex].ads = [];
  }

  // 处理 selectUnitIds：如果是完整数据对象，保留完整对象；如果是 id，从 adUnitMap 获取
  const materials = props.selectUnitIds.map(item => {
    // 如果是对象，直接使用
    if (typeof item === 'object' && item !== null) {
      return item;
    }
    // 如果是字符串（id），从 adUnitMap 获取完整数据
    const unit = props.adUnitMap.get(item);
    return unit || item;
  }).filter(item => item !== null && item !== undefined);

  // 处理素材，为 detail 添加 selected 属性（默认第一个被选中）
  const processedMaterials = materials.map(material => processMaterialWithDetail(material));
  
  props.data.campaigns[cIndex].ad_groups[gIndex].ads = [
    ...props.data.campaigns[cIndex].ad_groups[gIndex].ads,
    ...processedMaterials
  ];
  
  ElMessage.success(`已添加 ${processedMaterials.length} 个素材`);
  emit("clear-select");
};

const getMaterialImage = (ad) => {
  console.log('ad', ad);
  console.log('props.adUnitMap', props.adUnitMap);
  if (!ad) {
    return "";
  }
  
  // 如果传入的是完整数据对象，直接使用
  if (typeof ad === 'object' && ad !== null) {
    // 优先使用 material_urls[0].url（新数据格式）
    if (ad.material_urls?.[0]?.url) {
      return ad.material_urls[0].url;
    }
    // 兼容旧格式：material_info
    if (ad.material_info?.[0]?.origin_square?.[0]) {
      return ad.material_info[0].origin_square[0];
    }
    // 如果没有 material_urls，尝试使用 url
    if (ad.url) {
      return ad.url;
    }
    // 如果有 _id，尝试从 adUnitMap 获取
    if (ad._id || ad.id) {
      const unit = props.adUnitMap.get(ad._id || ad.id);
      return unit?.material_urls?.[0]?.url || unit?.material_info?.[0]?.origin_square?.[0] || unit?.url || "";
    }
    return "";
  }
  
  // 如果传入的是字符串（unitId），从 adUnitMap 获取
  const unit = props.adUnitMap.get(ad);
  if (!unit) {
    return "";
  }
  return unit?.material_urls?.[0]?.url || unit?.material_info?.[0]?.origin_square?.[0] || unit?.url || "";
};

// 复制粘贴
const handleCopy = () => {
  if (copyCampaignData) copyCampaignData(props.data);
};

const handlePaste = () => {
  if (pasteCampaignData) pasteCampaignData(props.data, this);
};

// 删除卡片
const handleDelete = () => {
  emit("delete", props.index);
};

const updateCampaignConfigs = (configs) => {
  props.data.campaign_configs = configs;
};

const updateAllData = (newData) => {
  if (newData.campaigns) {
    props.data.campaigns = newData.campaigns;
  }
  if (newData.campaign_configs) {
    props.data.campaign_configs = newData.campaign_configs;
  }
  if (newData.logo_ids) {
    props.data.logo_ids = newData.logo_ids;
  }
  if (newData.call_to_action_text !== undefined) {
    props.data.call_to_action_text = newData.call_to_action_text;
  }
  if (newData.call_to_action_lang !== undefined) {
    props.data.call_to_action_lang = newData.call_to_action_lang;
  }
};

defineExpose({ updateCampaignConfigs, updateAllData });
</script>

<style scoped lang="scss">
.campaign-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;

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
      position: relative;
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

        .material-actions {
          opacity: 1;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .material-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s;
      }
    }
  }
}

</style>
