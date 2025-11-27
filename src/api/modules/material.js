import request from '../request'

/**
 * 素材相关接口 (参考 sp 项目)
 */

// 获取素材列表 (对应 sp 项目的 getMaterialAll)
// 必需参数: workbench_type (1=普通用户, 3=管理员)
export function getMaterialList(data) {
  const defaultParams = {
    workbench_type: 1,  // 必需参数！1=普通用户, 3=管理员
    page: 1,
    offset: 100,  // sp 项目使用 offset 而不是 page_size
    project: null,
    tag: null,
    ch_name: null,
    status: null
  }
  
  return request({
    url: '/material_square/material/get_all_works_new',
    method: 'post',
    data: { ...defaultParams, ...data }
  })
}

// 更新素材信息
export function updateMaterial(id, data) {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    formData.append(key, data[key])
  })
  return request({
    url: '/material_square/material/designer/update_image_material',
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除素材
export function deleteMaterial(id) {
  return request({
    url: '/material_square/material/designer/delete_material_by_id',
    method: 'post',
    data: { material_ids: [id] }
  })
}

// 批量删除素材
export function batchDeleteMaterial(ids) {
  return request({
    url: '/material_square/material/designer/delete_material_by_id',
    method: 'post',
    data: { material_ids: ids }
  })
}

// 获取项目列表
export function getProject() {
  return request({
    url: '/material_square/material/project',
    method: 'get'
  })
}

// 获取标签
export function getTag() {
  return request({
    url: '/material_square/material/tag',
    method: 'get'
  })
}

