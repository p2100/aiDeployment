<script setup>
import { ref, provide, onMounted, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import TopBar from "@components/TopBar.vue";
import SideBar from "@components/SideBar.vue";
import CampaignGrid from "@components/CampaignGrid.vue";
import { createDefaultCampaignSet } from "@types/campaign";
import { indexApi } from "@api/index";

const topBarRef = ref(null);
const sidebarRef = ref(null);
const campaignGridRef = ref(null);

// CampaignSets 数据
const campaignSets = ref([]);

// Campaign 剪贴板
const campaignClipboard = ref(null);

const accountUserInfo = ref(null);

const accountSelectedInfos = ref([]);

// 组件挂载时加载数据
onMounted(async () => {
  await getAccountInfo();
  // 初始化一个 CampaignSet
  if (campaignSets.value.length === 0) {
    campaignSets.value.push(createDefaultCampaignSet());
  }
});

const getAccountInfo = async () => {
  const res = await indexApi.getUserAccountInfo();
  accountUserInfo.value = res.data;
};

// 添加新卡片
const handleAddNew = () => {
  campaignSets.value.push(createDefaultCampaignSet());
  ElMessage.success("已添加新配置面板");
};

// 删除卡片
const handleDelete = (index) => {
  if (index >= 0 && index < campaignSets.value.length) {
    campaignSets.value.splice(index, 1);
    ElMessage.success("已删除配置面板");
  }
};

// 获取侧边栏选中的素材
const getSelectedImages = () => {
  if (sidebarRef.value) {
    return sidebarRef.value.getSelectedImages();
  }
  return [];
};

// 获取选中的单元 IDs
const selectUnitIds = computed(() => {
  return sidebarRef.value?.getSelectedUnitIds?.() || [];
});

// 获取 adUnitMap
const adUnitMap = computed(() => {
  return sidebarRef.value?.adUnitMap || new Map();
});

// 获取选中的站点
const selectedSite = computed(() => {
  return topBarRef.value?.selectedSite || "";
});

// 获取选中的投放方式
const selectedMethod = computed(() => {
  return topBarRef.value?.selectedMethod || "DC";
});

// 监听站点变化，清空所有卡片的logo数据、Campaign配置、号召性文字、campaign数据和已选账户信息
const previousSite = ref("");
watch(selectedSite, (newSite, oldSite) => {
  if (oldSite !== "" && newSite !== oldSite) {
    campaignSets.value.forEach((item) => {
      // 清空logo数据
      item.logo_ids = [];
      // 清空Campaign配置
      item.campaign_configs = [];
      // 清空号召性文字
      item.call_to_action_text = "";
      item.call_to_action_lang = "";
      // 清空campaign数据
      item.campaigns = [];
    });
    // 清空已选账户信息
    if (accountSelectedInfos.value.length > 0) {
      accountSelectedInfos.value = [];
    }
    ElMessage.info("站点已切换，已清空所有配置数据");
  }
  previousSite.value = newSite;
});

// 清空选择
const clearSelect = () => {
  // TODO: 实现清空选择逻辑
};

// 复制 CampaignSet 数据
const copyCampaignData = (data) => {
  campaignClipboard.value = JSON.parse(JSON.stringify(data));
  ElMessage.success("已复制数据");
};

// 粘贴 CampaignSet 数据
const pasteCampaignData = (targetData, targetInstance) => {
  if (!campaignClipboard.value) {
    ElMessage.warning("剪贴板为空");
    return;
  }

  const copiedData = JSON.parse(JSON.stringify(campaignClipboard.value));

  Object.assign(targetData, {
    campaigns: copiedData.campaigns || [],
    campaign_configs: copiedData.campaign_configs || [],
    logo_ids: copiedData.logo_ids || [],
    call_to_action_text: copiedData.call_to_action_text || "",
    call_to_action_lang: copiedData.call_to_action_lang || "",
  });

  ElMessage.success("已粘贴数据");
};

// 同步配置到所有其他卡片
const syncCampaignConfig = (sourceConfigs, sourceCardRef) => {
  if (campaignGridRef.value) {
    campaignGridRef.value.syncConfigToAllCards(sourceConfigs, sourceCardRef);
  }
  // 同步到服务器
  if (sourceConfigs && sourceConfigs.length > 0) {
    syncConfigApi(sourceConfigs);
  }
};

// 提交到服务器
const handleSubmit = async () => {
  try {
    // 获取顶部栏的站点和投放方式
    const site = topBarRef.value?.selectedSite || "";
    const method = topBarRef.value?.selectedMethod || "DC";
    const logoIds = topBarRef.value?.selectedLogoIds || [];

    // 校验必填项
    // 1. 校验站点
    if (!site) {
      ElMessage.warning("请选择站点");
      return;
    }

    // 2. 校验投放方式
    if (!method) {
      ElMessage.warning("请选择投放方式");
      return;
    }

    // 3. 校验logo
    if (!logoIds || logoIds.length === 0) {
      ElMessage.warning("请至少选择一个logo");
      return;
    }

    // 4. 校验账户信息
    if (!accountSelectedInfos.value || accountSelectedInfos.value.length === 0) {
      ElMessage.warning("请至少选择一个账户信息");
      return;
    }

    // 5. 校验Campaign卡片里的campaign配置和campaign
    if (!campaignSets.value || campaignSets.value.length === 0) {
      ElMessage.warning("请至少添加一个Campaign卡片");
      return;
    }

    // 检查每个卡片是否有campaign配置、campaign和号召性文字
    for (let i = 0; i < campaignSets.value.length; i++) {
      const item = campaignSets.value[i];
      
      // 校验campaign配置
      if (!item.campaign_configs || !Array.isArray(item.campaign_configs) || item.campaign_configs.length === 0) {
        ElMessage.warning(`第 ${i + 1} 个Campaign卡片缺少campaign配置，请添加campaign配置`);
        return;
      }

      // 校验campaign
      if (!item.campaigns || !Array.isArray(item.campaigns) || item.campaigns.length === 0) {
        ElMessage.warning(`第 ${i + 1} 个Campaign卡片缺少campaign数据，请添加campaign`);
        return;
      }

      // 校验号召性文字
      if (!item.call_to_action_text || item.call_to_action_text.trim() === "") {
        ElMessage.warning(`第 ${i + 1} 个Campaign卡片缺少号召性文字，请选择号召性文字`);
        return;
      }

      if (!item.call_to_action_lang || item.call_to_action_lang.trim() === "") {
        ElMessage.warning(`第 ${i + 1} 个Campaign卡片缺少号召性文字语言，请选择号召性文字语言`);
        return;
      }
    }

    // // 扁平化 campaign_configs：将所有卡片的 campaign_configs 合并成一个数组
    // const allCampaignConfigs = campaignSets.value.reduce((acc, item) => {
    //   if (item.campaign_configs && Array.isArray(item.campaign_configs)) {
    //     acc.push(...item.campaign_configs);
    //   }
    //   return acc;
    // }, []);

    // 转换 campaigns 数据结构
    const transformCampaigns = (campaigns) => {
      if (!campaigns || !Array.isArray(campaigns)) {
        return [];
      }
      
      return campaigns.map((campaign) => {
        const transformedCampaign = {
          ...campaign,
        };
        
        // 如果 campaign 有 logo_ids，保留它
        if (campaign.logo_ids && Array.isArray(campaign.logo_ids) && campaign.logo_ids.length > 0) {
          transformedCampaign.logo_ids = campaign.logo_ids;
        }
        
        // 转换 ad_groups
        if (campaign.ad_groups && Array.isArray(campaign.ad_groups)) {
          transformedCampaign.ad_groups = campaign.ad_groups.map((adGroup) => {
            const transformedAdGroup = {
              ...adGroup,
            };
            
            // 将 ads 改为 ad_units，并转换数据结构
            if (adGroup.ads && Array.isArray(adGroup.ads)) {
              transformedAdGroup.ad_units = adGroup.ads.map((ad) => {
                const transformedAd = {
                  ...ad,
                };
                
                // 将 material_urls 改为 material
                if (ad.material_urls && Array.isArray(ad.material_urls)) {
                  transformedAd.material = ad.material_urls;
                  delete transformedAd.material_urls;
                }
                
                // detail 只传选择的数据（selected: true）
                if (ad.detail && Array.isArray(ad.detail)) {
                  transformedAd.detail = ad.detail.filter((item) => item.selected === true);
                  // 如果没有选中的 detail，保留空数组
                  if (transformedAd.detail.length === 0) {
                    transformedAd.detail = [];
                  }
                } else {
                  transformedAd.detail = [];
                }
                
                return transformedAd;
              });
              // 删除原来的 ads
              delete transformedAdGroup.ads;
            } else {
              transformedAdGroup.ad_units = [];
            }
            
            return transformedAdGroup;
          });
        }
        
        return transformedCampaign;
      });
    };
    console.log(accountSelectedInfos.value)
    // 准备提交数据
    const submitData = {
      campaign_num: campaignSets.value.length, // 卡片总数
      campaign_sets: campaignSets.value.map((item, index) => ({
        campaign_sets_index: index,
        site: site,
        method: method,
        // logo_ids: item.logo_ids || [],
        call_to_action_text: item.call_to_action_text || "",
        call_to_action_lang: item.call_to_action_lang || "",
        campaigns: transformCampaigns(item.campaigns || []).map((item1) => ({
          ...item1,
          logo_ids: item.logo_ids.map((item2) => item2._id),
        })),
        campaign_configs: item.campaign_configs || [], // campaign配置选择数据（扁平化后的数组）
      })), // 卡片数据
      customer_infos: accountSelectedInfos.value.map((item) => ({
        customer_id: item.id,
        mccid: item.mcc_id,
        asset_set_id: null,
        audience_id: null
      })), // 账户选择信息
      logo_ids: logoIds.map((item) => item._id),
      site: site, // 站点信息
      use_feed: false,
      use_audience: false,
      category: "image",
    };
    submitData.campaign_sets.forEach((item) => {
      item.campaigns.forEach((item1) => {
         item1.ad_groups.forEach((item2) => {
          item2.ad_units.forEach((item3) => {
            item3.material_id = item3._id;
            delete item3._id;
          });
         });
      });
    });

    // TODO: 调用提交接口
    await indexApi.getAdTask(submitData);
    console.log("提交数据:", submitData);
    ElMessage.success("提交成功");
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败: " + (error.message || "未知错误"));
  }
};

// 提供给子组件使用
provide("copyCampaignData", copyCampaignData);
provide("pasteCampaignData", pasteCampaignData);
provide("syncCampaignConfig", syncCampaignConfig);
provide("handleSubmit", handleSubmit);
provide("clearSelect", clearSelect);

// 暴露方法
defineExpose({
  handleSubmit,
});
</script>

<template>
  <div class="common-layout">
    <el-container direction="vertical">
      <TopBar
        ref="topBarRef"
        :account-selected-infos="accountSelectedInfos"
        @update:account-selected-infos="accountSelectedInfos = $event"
      />
      <el-container class="content-container">
        <SideBar ref="sidebarRef" :site="selectedSite" />
        <el-main>
          <div class="scroll">
            <CampaignGrid
              ref="campaignGridRef"
              :campaign-sets="campaignSets"
              :select-unit-ids="selectUnitIds"
              :ad-unit-map="adUnitMap"
              :site="selectedSite"
              :method="selectedMethod"
              :account-user-info="accountUserInfo"
              @add-new="handleAddNew"
              @delete="handleDelete"
              @clear-select="clearSelect"
            />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.common-layout {
  position: relative;
  width: 100%;
  height: 100%;

  .el-container {
    height: 100%;
  }
  .content-container{
    height: calc(100% - 56px);
  }

  .el-header {
    height: 56px;
    padding: 0px;
  }

  .el-aside {
    width: 400px;
    // height: calc(100vh - 61px); //61px为顶部header盒子高度
    // height: calc(100% - 61px);
    height: 100%;
    overflow-y: auto;
  }

  .el-main {
    padding: 0 !important;
    // height: calc(100vh - 61px); //61px为顶部header盒子高度
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
}

.page-header {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;

  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.scroll {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-4 {
  gap: 16px;
}
</style>
