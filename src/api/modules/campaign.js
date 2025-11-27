import request from '../request'

/**
 * Campaign 相关接口 (参考 sp 项目)
 */

// 获取 Campaign 配置列表
export function getCampaignList(data) {
  return request({
    url: '/material_square/auto_ads/placement/get_campaign_configs',
    method: 'post',
    data: data || {}
  })
}

// 更新 Campaign 配置
export function updateCampaign(data) {
  return request({
    url: '/material_square/auto_ads/placement/update_campaign_configs',
    method: 'post',
    data
  })
}

// 添加 Campaign 配置
export function createCampaign(data) {
  return request({
    url: '/material_square/auto_ads/placement/add_campaign_configs',
    method: 'post',
    data
  })
}

// 删除 Campaign 配置
export function deleteCampaign(data) {
  return request({
    url: '/material_square/auto_ads/placement/delete_campaign_config',
    method: 'post',
    data
  })
}

// 获取 Campaign 分组名称
export function getCampaignGroupName(data) {
  return request({
    url: '/material_square/auto_ads/placement/get_campaign_config_group_name',
    method: 'post',
    data
  })
}

// 添加 Campaign 分组
export function addCampaignGroup(data) {
  return request({
    url: '/material_square/auto_ads/placement/add_campaign_config_group',
    method: 'post',
    data
  })
}

// 获取 Campaign 分组配置
export function getCampaignGroup(data) {
  return request({
    url: '/material_square/auto_ads/placement/get_group_campaign_configs',
    method: 'post',
    data
  })
}

// 更新 Campaign 分组
export function updateCampaignGroup(data) {
  return request({
    url: '/material_square/auto_ads/placement/update_campaign_config_group',
    method: 'post',
    data
  })
}

// 删除 Campaign 分组
export function deleteCampaignGroup(data) {
  return request({
    url: '/material_square/auto_ads/placement/del_campaign_config_group',
    method: 'post',
    data
  })
}

// 提交广告任务
export function uploadAdTask(data) {
  return request({
    url: '/material_square/auto_ads/placement/upload_ad_task',
    method: 'post',
    data
  })
}

// 获取任务详情
export function getTaskDetails(data) {
  return request({
    url: '/material_square/auto_ads/placement/get_task_details',
    method: 'post',
    data
  })
}

// 获取广告单元列表
export function getAdUnit(data) {
  return request({
    url: '/material_square/auto_ads/placement/get_ad_unit',
    method: 'post',
    data
  })
}

