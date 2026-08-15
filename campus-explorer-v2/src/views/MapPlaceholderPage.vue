<template>
  <div class="page map-page">
    <div class="pg-head">
      <button class="back" @click="$router.back()"><PhArrowLeft :size="18" /></button>
      <h1>实景地图</h1>
    </div>

    <div class="map-empty">
      <span class="mp-icon"><PhMapTrifold :size="48" /></span>
      <h2>{{ schoolName }}</h2>
      <p>实景地图功能建设中，敬请期待</p>
      <button class="mp-btn" @click="$router.push('/school/' + route.params.slug)">返回学校详情</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SCHOOLS } from '../data/schools.js'
import { PhArrowLeft, PhMapTrifold } from '@phosphor-icons/vue'

const route = useRoute()
const schoolName = computed(() => SCHOOLS.find(x => x.slug === route.params.slug)?.name || '')
</script>

<style scoped>
.map-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.map-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  text-align: center;
}
.mp-icon {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(107, 141, 191, .12);
  color: var(--info);
  border-radius: 50%;
  margin-bottom: 20px;
}
.map-empty h2 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.map-empty p {
  font-size: 14px;
  color: var(--text3);
  margin-bottom: 24px;
}
.mp-btn {
  padding: 10px 28px;
  background: var(--text);
  color: var(--bg);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
}
</style>
