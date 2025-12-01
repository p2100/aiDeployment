import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  base: '/campaigns/', // 项目基础路径
  plugins: [
    vue(),
    federation({
      name: 'home', // 远程模块名称
      filename: 'main.js', // 远程模块入口文件，与本地模块中`remotes`配置相对应
      exposes: {  // 组件名称及其对应文件
        './index': './src/views/index.vue'
      },
      shared: ["vue","vuex"] // 对外提供的组件所依赖的第三方依赖，这个例子使用了`vue`,`vuex`，此处还可以配置依赖版本，参考`Readme.md`
    })
  ],
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
    proxy: {
      "^/ai": {
        target: "http://192.168.12.64:8080", // 目标 API 地址
        changeOrigin: true, // 对于虚拟托管的站点，这个选项非常重要
        rewrite: (path) => path.replace(/^\/ai/, ""), // 重写路径
      },
      "^/api": {
        target: "http://new.sp.com", // 后端服务实际地址
        changeOrigin: true, //开启代理
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    target:'es2020', // 针对非行内样式，需要构建规格为 es2020，否则样式会失效，控制台给出提示
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        minifyInternalExports: false
      }
    }
  }
})
