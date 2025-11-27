import { ref } from 'vue'
import { accountApi } from '@api'
import { ElMessage } from 'element-plus'

/**
 * 账户管理 Composable
 */
export function useAccount() {
  const accounts = ref([])
  const selectedAccounts = ref([])
  const loading = ref(false)

  // 获取账户列表
  const fetchAccounts = async (data = {}) => {
    loading.value = true
    try {
      const res = await accountApi.getAccountList(data)
      // 处理返回数据
      const list = res?.data || res || []
      accounts.value = Array.isArray(list) ? list : []
      return accounts.value
    } catch (error) {
      console.error('获取账户列表失败:', error)
      accounts.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // 查询客户信息
  const queryCustomerInfo = async (data) => {
    try {
      const res = await accountApi.queryCustomerInfo(data)
      return res?.data || []
    } catch (error) {
      console.error('查询客户信息失败:', error)
      return []
    }
  }

  // 获取账户分组
  const fetchAccountGroups = async (site) => {
    try {
      const res = await accountApi.getAccountGroup(site)
      return res?.data || []
    } catch (error) {
      console.error('获取账户分组失败:', error)
      return []
    }
  }

  return {
    accounts,
    selectedAccounts,
    loading,
    fetchAccounts,
    queryCustomerInfo,
    fetchAccountGroups
  }
}

