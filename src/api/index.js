/**
 * API 统一导出
 */

export * as campaignApi from './modules/campaign'
export * as materialApi from './modules/material'
export * as logoApi from './modules/logo'
export * as accountApi from './modules/account'
export * as adgroupApi from './modules/adgroup'

// 也可以导出 request 实例供特殊需求使用
export { default as request } from './request'

