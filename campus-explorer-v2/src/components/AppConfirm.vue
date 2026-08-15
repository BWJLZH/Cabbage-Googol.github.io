<template>
  <transition name="mask">
    <div class="confirm-mask" v-if="confirmState.visible" @click.self="resolveConfirm(false)">
      <transition name="sheet">
        <div class="confirm-sheet">
          <div class="cs-handle"></div>
          <h3 class="cs-title">{{ confirmState.title }}</h3>
          <p class="cs-msg" v-if="confirmState.message">{{ confirmState.message }}</p>
          <div class="cs-acts">
            <button class="cs-cancel" @click="resolveConfirm(false)">取消</button>
            <button class="cs-ok" :class="{ danger: confirmState.danger }" @click="resolveConfirm(true)">确定</button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { confirmState, resolveConfirm } from '../composables/ui.js'
</script>

<style scoped>
.confirm-mask {
  position: fixed; inset: 0;
  background: rgba(26, 26, 46, .5);
  z-index: 700;
  display: flex; align-items: flex-end; justify-content: center;
}
.confirm-sheet {
  width: 100%;
  max-width: 430px;
  background: var(--bg);
  border-radius: 20px 20px 0 0;
  padding: 12px 20px 24px;
  box-sizing: border-box;
}
.cs-handle {
  width: 36px; height: 4px;
  border-radius: 2px;
  background: var(--bdr);
  margin: 0 auto 14px;
}
.cs-title {
  font-family: var(--font-heading);
  font-size: 17px; font-weight: 700;
  text-align: center;
  margin-bottom: 6px;
}
.cs-msg {
  font-size: 14px; color: var(--text2);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
}
.cs-acts { display: flex; gap: 12px; }
.cs-acts button {
  flex: 1;
  padding: 13px 0;
  border-radius: var(--radius-full);
  font-size: 15px; font-weight: 600;
  cursor: pointer;
}
.cs-cancel { background: var(--surface2); color: var(--text2); }
.cs-ok { background: var(--text); color: var(--bg); }
.cs-ok.danger { background: var(--warn); color: #fff; }

.mask-enter-active, .mask-leave-active { transition: opacity .2s; }
.mask-enter-from, .mask-leave-to { opacity: 0; }
.sheet-enter-active, .sheet-leave-active { transition: transform .25s var(--ease); }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
