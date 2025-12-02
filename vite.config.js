import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    target: ["es2015", "edge88", "firefox78", "chrome87", "safari14"]
  },
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
    base: './',
    host: "0.0.0.0",
    port: "3004",
    open: false, //自动打开
    cors: true, // 开启 CORS
    // headers: {
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    //     'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    // },
    proxy: {
      "^/api": {
        target: "http://192.168.12.64:8080", // 目标 API 地址
        changeOrigin: true, // 对于虚拟托管的站点，这个选项非常重要
        rewrite: (path) => path.replace(/^\/api/, ""), // 重写路径
      },
      // "^/api": {
      //   target: "http://new.sp.com", // 后端服务实际地址
      //   changeOrigin: true, //开启代理
      //   rewrite: (path) => path.replace(/^\/api/, ""),
      // },
    },
  }
})
