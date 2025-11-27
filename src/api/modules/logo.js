import request from '../request'

/**
 * Logo 相关接口 (参考 sp 项目)
 */

// 获取 Logo 列表
// 必需参数: project (项目名称)
export function getLogoList(params) {
  const defaultParams = {
    project: 'default',  // 必需参数！项目名称
  }
  
  return request({
    url: '/material_square/auto_ads/placement/get_logo_images',
    method: 'get',
    params: { ...defaultParams, ...params }
  })
}

// 上传 Logo
export function uploadLogo(formData) {
  return request({
    url: '/material_square/auto_ads/placement/add_logo_images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除 Logo
export function deleteLogo(data) {
  return request({
    url: '/material_square/auto_ads/placement/delete_logo_images',
    method: 'post',
    data
  })
}

// 更新 Logo
export function updateLogo(formData) {
  return request({
    url: '/material_square/auto_ads/placement/update_logo_image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

