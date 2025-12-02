import request from '../request'


// 站点查询
export function getAdUnitCopy(data) {
  return request({
    url: '/pub/get_project_info',
    method: 'post',
    data: data || {}
  })
}

// logo查询
export function getLogoImages(data) {
  return request({
    url: '/auto_ads/get_logo_images',
    method: 'get',
    params: data || {}
  })
}

// 素材查询
export function getMaterials(data) {
  return request({
    url: '/material/get_materials',
    method: 'post',
    data: data || {}
  })
}

// 账户查询
export function getAccountInfos(data) {
  return request({
    url: '/auto_ads/get_account_infos',
    method: 'post',
    data: data || {}
  })
}

// 用户查询
export function getUserAccountInfo(data) {
  return request({
    url: '/user/get_account_info',
    method: 'get',
    data: data || {}
  })
}

// campaign配置查询
export function getCampaignConfigs(data) {
  return request({
    url: '/auto_ads/get_campaign_configs',
    method: 'post',
    data: data || {}
  })
}

// 一键填充查询
export function getCampaignTemplateList(data) {
  return request({
    url: '/auto_ads/get_campaign_template_list',
    method: 'post',
    data: data || {}
  })
}

// 投放
export function getAdTask(data) {
  return request({
    url: '/auto_ads/ad_task',
    method: 'post',
    data: data || {}
  })
}


