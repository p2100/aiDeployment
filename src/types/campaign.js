/**
 * Campaign 数据类型定义 (参考 sp 项目)
 */

// Campaign 类型枚举
export const CampaignType = {
  DC: 'DC',
  DG: 'DG',
  PM: 'PMAX',
  DS: 'DS',
  RC: 'RC',
  Auto: 'Auto'
}

// 单元分类
export const UnitCategory = {
  IMAGE: 'image',
  VIDEO: 'video',
  CAROUSEL: 'carousel',
  MVP_IMAGE: 'mvp_image',
  DS_IMAGE: 'ds_image'
}

/**
 * 创建默认的 Campaign Set (对应卡片)
 */
export function createDefaultCampaignSet() {
  return {
    id: `panel_${Date.now()}_${Math.random()}`,
    __id: `set_${Date.now()}_${Math.random()}`,
    tag: '',
    custom_name: '',
    business_name: '',
    sync_custom_name: false,
    campaign_configs: [],
    campaigns: [],
    logo_ids: [],
    call_to_action_text: '',
    call_to_action_lang: ''
  }
}

/**
 * 创建默认的 Campaign
 */
export function createDefaultCampaign(index = 0) {
  return {
    __id: `campaign_${Date.now()}_${Math.random()}`,
    __templateId: undefined,
    ad_groups: [],
    message: [],
    status: 0,
    name: `Campaign ${index + 1}`
  }
}

/**
 * 创建默认的 AdGroup
 */
export function createDefaultAdGroup(name = 'AdGroup 1') {
  return {
    __id: `adgroup_${Date.now()}_${Math.random()}`,
    __templateId: undefined,
    ad_group_name: name,
    ads: [] // 存储 ad unit 的 _id
  }
}

/**
 * 创建提交数据结构
 */
export function createDeliverRequestBody(data) {
  return {
    use_feed: data.use_feed || false,
    use_audience: data.use_audience || false,
    campaign_num: data.campaign_num || 0,
    campaign_sets: data.campaign_sets || [],
    category: data.category || 'image',
    customer_infos: data.customer_infos || [],
    logo_ids: data.logo_ids || [],
    site: data.site || 'PT',
    campaign_type: data.campaign_type || CampaignType.DC
  }
}

/**
 * 获取 AdGroup 名称
 */
export function getDefaultAdGroupName(adUnit) {
  if (!adUnit) return 'AdGroup 1'
  
  // 优先使用 tag
  if (adUnit.tag) {
    return adUnit.tag
  }
  
  // 使用 language
  if (adUnit.language) {
    return adUnit.language
  }
  
  return 'AdGroup 1'
}

/**
 * 计算 Campaign 总数
 */
export function campNum(campaignSet) {
  if (!campaignSet || !campaignSet.campaigns) return 0
  return campaignSet.campaigns.length
}

/**
 * 计算素材总数
 */
export function getMaterialCount(campaignSet) {
  if (!campaignSet || !campaignSet.campaigns) return 0
  
  let count = 0
  campaignSet.campaigns.forEach(campaign => {
    if (campaign.ad_groups) {
      campaign.ad_groups.forEach(adGroup => {
        count += adGroup.ads?.length || 0
      })
    }
  })
  return count
}

/**
 * 获取对象唯一 key
 */
export function getObjKey(obj) {
  return obj?.__id || obj?._id || `obj_${Date.now()}`
}

