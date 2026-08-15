<template>
  <transition name="toast">
    <div class="app-toast" v-if="toastState.visible">{{ toastState.msg }}</div>
  </transition>
</template>

<script setup>
import { toastState } from '../composables/ui.js'
</script>

<style scoped>
.app-toast {
  position: fixed;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 600;
  padding: 10px 24px;
  background: rgba(26, 26, 46, .92);
  color: #fff;
  font-size: 14px;
  border-radius: 999px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, .15);
  max-width: 86vw;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toast-enter-active,
.toast-leave-active { transition: all .25s var(--ease); }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
