import request from '../request'

/**
 * 账户相关接口 (参考 sp 项目)
 */

// 获取账户信息列表
export function getAccountList(data) {
  return request({
    url: '/material_square/auto_ads/placement/get_account_infos',
    method: 'post',
    data: data || {}
  })
}

// 查询客户信息
export function queryCustomerInfo(data) {
  return request({
    url: '/material_square/auto_ads/query_customer_info',
    method: 'post',
    data
  })
}

// 检查 Campaign 设置
export function checkCampaignSetting(data) {
  return request({
    url: '/material_square/auto_ads/check_campagin_setting',
    method: 'post',
    data
  })
}

// 获取账户分组
export function getAccountGroup(site) {
  return request({
    url: '/material_square/auto_ads/get_account_group',
    method: 'get',
    params: { site }
  })
}

// 创建账户分组
export function createAccountGroup(data) {
  return request({
    url: '/material_square/auto_ads/create_account_group',
    method: 'post',
    data
  })
}

// 更新账户分组
export function updateAccountGroup(data) {
  return request({
    url: '/material_square/auto_ads/update_account_group',
    method: 'put',
    data
  })
}

// 删除账户分组
export function deleteAccountGroup(id) {
  return request({
    url: '/material_square/auto_ads/delete_account_group',
    method: 'delete',
    params: { id }
  })
}

