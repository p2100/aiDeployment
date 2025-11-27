import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: "3004",
    open: false, //自动打开
    base: "./ ", //生产环境路径
    proxy: {
      // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
      // 正则表达式写法
      // '^/api/lr': {
      //   target: 'http://172.18.187.249:8090',
      //   changeOrigin: true,
      //   rewrite: path => path.replace(/^\/api\/lr/, '')
      // },
      "^/api/ai/mvp": {
        target: "http://192.168.12.72:3066", // 目标 API 地址
        changeOrigin: true, // 对于虚拟托管的站点，这个选项非常重要
        rewrite: (path) => path.replace(/^\/api\/ai\/mvp/, ""), // 重写路径
      },
      "^/ai/api": {
        target: "https://ai.cms4.cc/api", // 目标 API 地址
        changeOrigin: true, // 对于虚拟托管的站点，这个选项非常重要
        rewrite: (path) => path.replace(/^\/ai\/api/, ""), // 重写路径
      },
      "^/api": {
        target: "http://new.sp.com", // 后端服务实际地址
        //target: "http://testapi.sp.com", // 后端测试服务地址
        // target: "http://172.18.188.5:2025", // 后端测试服务ip地址
        // target: 'http://192.168.2.16:8080', // wq 本地服务
        //target: "http://172.18.188.124:8080", //lx 本地服务
        // target: "http://192.168.12.5:8080", // lr 本地服务
        // target: 'http://192.168.100.157:8080',
        // target: 'http://192.168.100.166:8080',
        // target: 'http://172.18.187.109:8080',
        // target: 'http://172.18.187.174:8080', // yxg 本地服务``
        // target: "http://172.18.188.5:2025/", // 测试服务器
        // target: "http://192.168.12.7:8080", // ljw服务器
        changeOrigin: true, //开启代理
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "^/aiManage": {
        // target: `https://zb.jarvis1.cc`, // 后端服务实际地址
        target: `http://localhost:8080`, // 后端服务实际地址
        changeOrigin: true, //开启代理
        rewrite: (path) => path.replace(/^\/aiManage/, "")
      }
    },
  },
})
