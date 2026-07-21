<template>
  <!-- ==========================================================
       AI 问答悬浮球 — 全局组件，所有页面可见
       · 右下角悬浮，支持拖拽移动
       · 点击展开/收起聊天面板
       · 支持流式输出（打字机效果）
       ========================================================== -->
  <div
    class="ai-floating-root"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    ref="rootRef"
  >
    <!-- ========== 聊天面板 ========== -->
    <transition name="panel">
      <div class="ai-panel" v-if="isOpen" @click.stop>
        <!-- 头部 -->
        <div class="ai-panel-header">
          <div class="ai-panel-brand">
            <span class="ai-panel-avatar">🎓</span>
            <div>
              <span class="ai-panel-title">AI 学长</span>
              <span class="ai-panel-sub">校园搜助手</span>
            </div>
          </div>
          <button class="ai-panel-close" @click="isOpen = false">✕</button>
        </div>

        <!-- 消息区 -->
        <div class="ai-panel-body" ref="msgListRef">
          <!-- 开场白 -->
          <div class="ai-msg ai-msg--bot" v-if="messages.length === 0">
            <div class="ai-bubble">
              <p>你好！我是 AI 学长 👋</p>
              <p>关于大学宿舍、食堂、校园环境、专业选择... 什么都可以问我～</p>
            </div>
          </div>

          <!-- 历史消息 -->
          <div
            class="ai-msg"
            :class="m.role === 'user' ? 'ai-msg--user' : 'ai-msg--bot'"
            v-for="(m, i) in messages"
            :key="i"
          >
            <div class="ai-bubble">
              {{ m.content }}
              <!-- 流式输出中的光标 -->
              <span
                class="ai-cursor"
                v-if="m.streaming && i === messages.length - 1"
              >|</span>
            </div>
          </div>

          <!-- 加载指示器 -->
          <div class="ai-msg ai-msg--bot" v-if="isLoading && !streamingContent">
            <div class="ai-bubble ai-bubble--loading">
              <span class="ai-dot"></span>
              <span class="ai-dot"></span>
              <span class="ai-dot"></span>
            </div>
          </div>

          <!-- 错误提示 -->
          <div class="ai-msg ai-msg--bot" v-if="errorMsg">
            <div class="ai-bubble ai-bubble--error">{{ errorMsg }}</div>
          </div>
        </div>

        <!-- 底部输入区 -->
        <div class="ai-panel-foot">
          <input
            v-model="inputText"
            class="ai-input"
            placeholder="输入你的问题..."
            :disabled="isLoading"
            @keyup.enter="send"
          />
          <button
            class="ai-send"
            :disabled="!inputText.trim() || isLoading"
            @click="send"
          >→</button>
        </div>
      </div>
    </transition>

    <!-- ========== 悬浮球按钮 ========== -->
    <button
      class="ai-ball"
      :class="{ 'ai-ball--open': isOpen }"
      @click="togglePanel"
      @mousedown.prevent="startDrag"
      @touchstart.prevent="startDrag"
      ref="ballRef"
    >
      <span v-if="!isOpen">✨</span>
      <span v-else>✕</span>
    </button>
  </div>
</template>

<script setup>
// ============================================================
// 所有组合式 API 必须在 <script setup> 顶层调用
// ============================================================
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { fetchAIResponseStream, isApiConfigured } from '../services/aiService.js'

// ============================================================
// 面板开关
// ============================================================
const isOpen = ref(false)

function togglePanel() {
  isOpen.value = !isOpen.value
}

// ============================================================
// 消息列表
// ============================================================
const messages = ref([])            // { role: 'user'|'assistant', content: string, streaming?: boolean }
const inputText = ref('')
const isLoading = ref(false)
const streamingContent = ref('')    // 流式输出过程中暂存的完整文本
const errorMsg = ref('')
const msgListRef = ref(null)
const rootRef = ref(null)
const ballRef = ref(null)

// ============================================================
// 发送消息
// ============================================================
async function send() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  // 检查 API 配置
  if (!isApiConfigured()) {
    errorMsg.value = 'AI 尚未配置，请在 src/services/aiService.js 中填入 API 信息'
    return
  }

  // 清除旧错误
  errorMsg.value = ''

  // 添加用户消息
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  await scrollToBottom()

  // 构建请求上下文（最近 10 条消息）
  const context = messages.value
    .filter(m => !m.streaming)
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content }))

  // 初始化 AI 消息占位
  const aiMsg = { role: 'assistant', content: '', streaming: true }
  messages.value.push(aiMsg)
  isLoading.value = true
  streamingContent.value = ''

  try {
    const stream = await fetchAIResponseStream(context)

    for await (const chunk of stream) {
      streamingContent.value += chunk
      aiMsg.content = streamingContent.value
      await scrollToBottom()
    }

    aiMsg.streaming = false
  } catch (err) {
    // 移除空的 AI 占位消息
    if (!aiMsg.content) {
      messages.value.pop()
    } else {
      aiMsg.streaming = false
    }
    errorMsg.value = err.message || '请求失败，请稍后重试'
  } finally {
    isLoading.value = false
    streamingContent.value = ''
  }
}

// ============================================================
// 自动滚动到底部
// ============================================================
async function scrollToBottom() {
  await nextTick()
  const el = msgListRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

// ============================================================
// 拖拽功能
// ============================================================
const position = reactive({ x: 0, y: 0 })   // 球的位置（left, top）
const dragging = ref(false)
let dragStart = { x: 0, y: 0, posX: 0, posY: 0 }
const BALL_SIZE = 52   // 悬浮球直径
const EDGE_MARGIN = 16 // 距屏幕边缘的安全距离

// 初始定位到右下角
function resetPosition() {
  position.x = window.innerWidth - BALL_SIZE - EDGE_MARGIN
  position.y = window.innerHeight - BALL_SIZE - EDGE_MARGIN - 80
}

function startDrag(e) {
  if (isOpen.value) return  // 面板展开时不允许拖拽

  dragging.value = true
  const touch = e.touches ? e.touches[0] : e
  dragStart = {
    x: touch.clientX,
    y: touch.clientY,
    posX: position.x,
    posY: position.y
  }

  // 绑定全局移动/释放事件
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  if (!dragging.value) return

  const touch = e.touches ? e.touches[0] : e
  const dx = touch.clientX - dragStart.x
  const dy = touch.clientY - dragStart.y

  let newX = dragStart.posX + dx
  let newY = dragStart.posY + dy

  // 限制在可视区域内
  newX = Math.max(EDGE_MARGIN, Math.min(newX, window.innerWidth - BALL_SIZE - EDGE_MARGIN))
  newY = Math.max(EDGE_MARGIN, Math.min(newY, window.innerHeight - BALL_SIZE - EDGE_MARGIN))

  position.x = newX
  position.y = newY
}

function stopDrag() {
  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

// ============================================================
// 窗口大小变化时确保悬浮球不跑出可视区域
// ============================================================
function onResize() {
  position.x = Math.min(position.x, window.innerWidth - BALL_SIZE - EDGE_MARGIN)
  position.y = Math.min(position.y, window.innerHeight - BALL_SIZE - EDGE_MARGIN)
  position.x = Math.max(position.x, EDGE_MARGIN)
  position.y = Math.max(position.y, EDGE_MARGIN)
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  resetPosition()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* ============================================================
   根容器 — 固定定位，left/top 由 JS 控制
   z-index: 300 确保在所有页面元素之上
   ============================================================ */
.ai-floating-root {
  position: fixed;
  z-index: 300;
  /* 初始值，JS 会覆盖 */
  left: 0;
  top: 0;
}

/* ============================================================
   悬浮球按钮
   ============================================================ */
.ai-ball {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .15);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .25s var(--ease);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.ai-ball:active {
  transform: scale(.92);
}

.ai-ball--open {
  background: var(--accent2);
  box-shadow: 0 4px 20px rgba(184, 115, 81, .3);
}

/* ============================================================
   聊天面板
   ============================================================ */
.ai-panel {
  position: absolute;
  right: 0;
  bottom: 64px;  /* 悬浮球上方 */
  width: 340px;
  max-width: calc(100vw - 32px);
  height: 480px;
  max-height: calc(100dvh - 140px);
  background: var(--surface);
  border: 1px solid var(--bdr);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, .1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---- 面板过渡动画 ---- */
.panel-enter-active,
.panel-leave-active {
  transition: all .25s var(--ease);
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(.95);
}

/* ---- 头部 ---- */
.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--bdr);
  flex-shrink: 0;
}

.ai-panel-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-panel-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface2);
  border-radius: 50%;
  font-size: 18px;
}

.ai-panel-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.ai-panel-sub {
  font-size: 11px;
  color: var(--text3);
}

.ai-panel-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text3);
  cursor: pointer;
  transition: all .15s;
}

.ai-panel-close:hover {
  background: var(--surface2);
  color: var(--text);
}

/* ---- 消息区 ---- */
.ai-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- 消息气泡 ---- */
.ai-msg {
  display: flex;
  max-width: 85%;
}

.ai-msg--user {
  align-self: flex-end;
}

.ai-msg--bot {
  align-self: flex-start;
}

.ai-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.65;
  word-break: break-word;
}

.ai-msg--user .ai-bubble {
  background: var(--text);
  color: var(--bg);
  border-bottom-right-radius: 4px;
}

.ai-msg--bot .ai-bubble {
  background: var(--surface2);
  color: var(--text);
  border-bottom-left-radius: 4px;
}

.ai-msg--bot .ai-bubble p {
  margin: 0;
}

.ai-msg--bot .ai-bubble p + p {
  margin-top: 6px;
}

/* ---- 加载动画 ---- */
.ai-bubble--loading {
  display: flex;
  gap: 6px;
  padding: 14px 18px;
}

.ai-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text3);
  animation: ai-bounce 1.2s infinite;
}

.ai-dot:nth-child(2) { animation-delay: .2s; }
.ai-dot:nth-child(3) { animation-delay: .4s; }

@keyframes ai-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: .4; }
  40% { transform: translateY(-6px); opacity: 1; }
}

/* ---- 流式光标 ---- */
.ai-cursor {
  display: inline-block;
  animation: ai-blink .7s infinite;
  font-weight: 300;
  margin-left: 1px;
}

@keyframes ai-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ---- 错误提示 ---- */
.ai-bubble--error {
  background: rgba(196, 112, 98, .08) !important;
  color: var(--warn) !important;
  font-size: 13px;
}

/* ---- 底部输入区 ---- */
.ai-panel-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--bdr);
  flex-shrink: 0;
}

.ai-input {
  flex: 1;
  padding: 10px 14px;
  background: var(--surface2);
  border: 1px solid var(--bdr);
  border-radius: var(--radius-full);
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: border-color .2s;
  font-family: var(--font);
}

.ai-input:focus {
  border-color: var(--accent2);
}

.ai-input::placeholder {
  color: var(--text3);
}

.ai-input:disabled {
  opacity: .5;
}

.ai-send {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all .15s;
}

.ai-send:hover:not(:disabled) {
  background: var(--accent2);
}

.ai-send:disabled {
  opacity: .3;
  cursor: not-allowed;
}
</style>
