import request from '../request'

/**
 * AdGroup 相关接口
 */

// 创建 AdGroup
export function createAdGroup(campaignId, data) {
  return request({
    url: `/campaign/${campaignId}/adgroup`,
    method: 'post',
    data
  })
}

// 更新 AdGroup
export function updateAdGroup(campaignId, adGroupId, data) {
  return request({
    url: `/campaign/${campaignId}/adgroup/${adGroupId}`,
    method: 'put',
    data
  })
}

// 删除 AdGroup
export function deleteAdGroup(campaignId, adGroupId) {
  return request({
    url: `/campaign/${campaignId}/adgroup/${adGroupId}`,
    method: 'delete'
  })
}

// 追加素材到 AdGroup
export function appendMaterialsToAdGroup(campaignId, adGroupId, materialIds) {
  return request({
    url: `/campaign/${campaignId}/adgroup/${adGroupId}/materials`,
    method: 'post',
    data: { materialIds }
  })
}

// 移除 AdGroup 中的素材
export function removeMaterialFromAdGroup(campaignId, adGroupId, materialId) {
  return request({
    url: `/campaign/${campaignId}/adgroup/${adGroupId}/materials/${materialId}`,
    method: 'delete'
  })
}

