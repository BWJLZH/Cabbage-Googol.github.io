import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    open: true,

    // ==========================================================
    // ★ CORS 代理 — 解决浏览器直接调 AI API 被拦截的问题
    //
    // 原理：浏览器请求 localhost → Vite 服务端转发到真实 API
    //        浏览器看到的是同源请求，不存在跨域
    //
    // 示例（通义千问兼容模式）：
    //   前端调用 /api/ai/compatible-mode/v1/chat/completions
    //          ↓ Vite 改写为 /compatible-mode/v1/chat/completions
    //          ↓ 转发到 https://dashscope.aliyuncs.com
    //
    // ★ 换了 API 提供商时改下面两处：
    //    1. target: 填新 API 的源（协议+域名）
    //    2. rewrite: 保持 /api/ai 前缀替换逻辑不变即可（通用）
    // ==========================================================
    proxy: {
      '/api/ai': {
        target: 'https://dashscope.aliyuncs.com',   // ← 你的 API 服务器地址
        changeOrigin: true,                          // 伪装请求来源
        rewrite: (path) => path.replace(/^\/api\/ai/, '')  // 去掉 /api/ai 前缀
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
