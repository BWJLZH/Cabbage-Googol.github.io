// ============================================================
// AI 问答服务 — 统一管理 API 配置和请求
// ============================================================
//
// 【CORS 问题说明】
// 浏览器不允许直接跨域请求 AI API（如 dashscope.aliyuncs.com）。
// 开发模式通过 Vite 代理转发（见 vite.config.js），生产环境
// 需配置 Nginx / Cloudflare Worker 等反向代理。
//
// 【接入指南】
// 1. 在下方 AI_CONFIG 中填入你的 API 信息
// 2. 如果换了 API 提供商，同步修改 vite.config.js 中的 proxy.target
// 3. apiKey 生产环境请通过后端代理注入，不要暴露在前端代码中
//
// 【各平台示例（都是 OpenAI 兼容格式的 chat/completions 端点）】
// 通义千问:  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
//            apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
//            model:  'qwen-max'
//
// DeepSeek:  apiUrl: 'https://api.deepseek.com/v1/chat/completions'
//            apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
//            model:  'deepseek-chat'
//
// OpenAI:    apiUrl: 'https://api.openai.com/v1/chat/completions'
//            apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
//            model:  'gpt-4o-mini'
// ============================================================

const AI_CONFIG = {
  // ==========================================================
  // TODO ★★★ 在这里填入你的 API 信息 ★★★
  //
  // 【重要】apiUrl 填 OpenAI 兼容格式的 chat/completions 端点
  //        不要填 DashScope App 页面地址（如 /apps/xxx），那不是 API 端点！
  //
  // 通义千问（推荐）：apiUrl 填兼容模式端点，model 填 qwen 系列
  // DeepSeek：apiUrl 填 DeepSeek 端点
  // ==========================================================
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',   // ← 通义千问兼容模式（OpenAI 格式）
  apiKey: 'sk-ws-H.EHIHLED.dGUO.MEYCIQCYkUGOVtmCJOLc8NON0Zy9UB2Yzb_LOiY-8h8nLmPEZwIhAMSkRI9hdAcDkCNqkW16d9hdOKYzyITCS2epz6cF0fYe',   // ← 必填：API 密钥
  model: 'qwen-max',    // ← 模型名（qwen-max / qwen-turbo / qwen-plus）

  // ==========================================================
  // 可选配置
  // ==========================================================
  maxTokens: 2048,       // 单次回复最大 token 数
  temperature: 0.7,      // 创造性（0-2，越高越随机）
  systemPrompt: `你是"校园搜"的AI学长助手，专门为高考生解答大学相关问题。
你的回答风格：
- 友好、口语化，像学长跟学弟学妹聊天一样
- 回答精炼，控制在200字以内
- 基于真实情况回答，不确定的就说不太清楚，建议查官网
- 适当使用 emoji 增加亲和力 😊`
}

// ============================================================
// 构建请求 URL — 开发模式走 Vite 代理，生产模式直连
// ============================================================
function getRequestUrl() {
  // 开发环境：通过 Vite 代理转发，绕过浏览器 CORS 限制
  //   /api/ai/apps/anthropic → Vite 改写为 /apps/anthropic
  //   → 转发到 https://dashscope.aliyuncs.com
  if (import.meta.env.DEV) {
    try {
      const url = new URL(AI_CONFIG.apiUrl)
      return '/api/ai' + url.pathname + url.search
    } catch {
      // 如果 apiUrl 格式不对，直接返回原值（会触发 CORS 报错，便于排查）
      return AI_CONFIG.apiUrl
    }
  }
  // 生产环境：需要后端反向代理处理 CORS
  return AI_CONFIG.apiUrl
}

// ============================================================
// 检查 API 是否已配置
// ============================================================
export function isApiConfigured() {
  return !!(AI_CONFIG.apiUrl && AI_CONFIG.apiKey && AI_CONFIG.model)
}

// ============================================================
// 构建请求体（OpenAI 兼容格式，DashScope / DeepSeek 通用）
// ============================================================
function buildBody(messages, stream = false) {
  return {
    model: AI_CONFIG.model,
    messages: [
      { role: 'system', content: AI_CONFIG.systemPrompt },
      ...messages
    ],
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature,
    stream
  }
}

// ============================================================
// 解析非流式响应 — 兼容多种 API 返回格式
// ============================================================
function parseResponse(data) {
  // OpenAI / DeepSeek / 通义千问兼容模式:
  //   { choices: [{ message: { content: "..." } }] }
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content
  }
  // 通义千问 DashScope 原生格式:
  //   { output: { text: "..." } }
  if (data.output?.text) {
    return data.output.text
  }
  // 通义千问 DashScope App 格式（/apps/* 端点可能返回不同结构）:
  //   { output: { choices: [...] } } 或其他
  if (data.output?.choices?.[0]?.message?.content) {
    return data.output.choices[0].message.content
  }
  // 兜底：尝试在 data 中递归查找 content
  const fallback = findContent(data)
  if (fallback) return fallback

  console.warn('[AI Service] 无法解析响应格式:', JSON.stringify(data).slice(0, 300))
  throw new Error('AI 返回了无法识别的数据格式，请检查 API 配置。打开浏览器控制台查看详情。')
}

// 递归查找第一个 content 字段（兜底逻辑）
function findContent(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 3) return null
  if (typeof obj.content === 'string') return obj.content
  if (typeof obj.text === 'string') return obj.text
  for (const key of Object.keys(obj)) {
    const found = findContent(obj[key], depth + 1)
    if (found) return found
  }
  return null
}

// ============================================================
// 解析流式 SSE 数据行 — 兼容多种 API
// ============================================================
function parseStreamChunk(parsed) {
  // OpenAI / DeepSeek / 通义千问兼容流式:
  //   { choices: [{ delta: { content: "..." } }] }
  if (parsed.choices?.[0]?.delta?.content) {
    return parsed.choices[0].delta.content
  }
  // 通义千问 DashScope 原生流式:
  //   { output: { text: "..." } }
  if (parsed.output?.text) {
    return parsed.output.text
  }
  // DashScope App 可能返回不同格式
  if (parsed.output?.choices?.[0]?.delta?.content) {
    return parsed.output.choices[0].delta.content
  }
  // 兜底: 递归查找 delta.content 或 text
  const delta = findContent(parsed)
  return delta || null
}

// ============================================================
// 非流式请求（备用）
// ============================================================
export async function fetchAIResponse(messages) {
  if (!isApiConfigured()) {
    throw new Error('AI 服务未配置，请在 src/services/aiService.js 中填入 apiUrl、apiKey 和 model')
  }

  const requestUrl = getRequestUrl()
  console.log('[AI Service] 非流式请求 →', requestUrl)

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify(buildBody(messages, false))
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[AI Service] 请求失败:', response.status, errorText)
    try {
      const error = JSON.parse(errorText)
      throw new Error(error.error?.message || error.message || `HTTP ${response.status}`)
    } catch (e) {
      if (e.message && e.message !== `HTTP ${response.status}`) throw e
      throw new Error(`请求失败 (HTTP ${response.status})，请检查 API 地址和密钥是否正确`)
    }
  }

  const data = await response.json()
  console.log('[AI Service] 响应数据:', JSON.stringify(data).slice(0, 300))
  return parseResponse(data)
}

// ============================================================
// 流式请求 — 返回 async iterator，逐块 yield delta 文本
// ============================================================
export async function fetchAIResponseStream(messages) {
  if (!isApiConfigured()) {
    throw new Error('AI 服务未配置，请在 src/services/aiService.js 中填入 apiUrl、apiKey 和 model')
  }

  const requestUrl = getRequestUrl()
  console.log('[AI Service] 流式请求 →', requestUrl)

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify(buildBody(messages, true))
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[AI Service] 请求失败:', response.status, errorText)
    try {
      const error = JSON.parse(errorText)
      throw new Error(error.error?.message || error.message || `HTTP ${response.status}`)
    } catch (e) {
      if (e.message && e.message !== `HTTP ${response.status}`) throw e
      throw new Error(`请求失败 (HTTP ${response.status})，请检查 API 地址和密钥是否正确`)
    }
  }

  // ==========================================================
  // 读取流式响应，解析 SSE 格式
  // ==========================================================
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let chunkCount = 0

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue

          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') {
            console.log('[AI Service] 流式输出完成，共', chunkCount, '个片段')
            return
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parseStreamChunk(parsed)
            if (delta) {
              chunkCount++
              yield delta
            }
          } catch {
            // 跳过无法解析的行
          }
        }
      }
      console.log('[AI Service] 流式输出完成，共', chunkCount, '个片段')
    },

    cancel() {
      reader.cancel()
    }
  }
}
