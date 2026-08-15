// ============================================================
// 全局轻提示 + 确认框（移动端适配，替代原生 alert/confirm/prompt）
// 由 App.vue 挂载的 AppToast / AppConfirm 组件消费本模块状态
// ============================================================
import { reactive } from 'vue'

// ---------- 轻提示 ----------
export const toastState = reactive({ visible: false, msg: '' })
let toastTimer = null

export function showToast(msg) {
  toastState.msg = msg
  toastState.visible = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastState.visible = false }, 2000)
}

// ---------- 确认框（底部弹层） ----------
export const confirmState = reactive({
  visible: false,
  title: '',
  message: '',
  danger: false,
  resolve: null
})

export function showConfirm({ title = '确认操作', message = '', danger = false } = {}) {
  return new Promise(resolve => {
    confirmState.title = title
    confirmState.message = message
    confirmState.danger = danger
    confirmState.resolve = resolve
    confirmState.visible = true
  })
}

export function resolveConfirm(ok) {
  confirmState.visible = false
  const r = confirmState.resolve
  confirmState.resolve = null
  r?.(ok)
}
