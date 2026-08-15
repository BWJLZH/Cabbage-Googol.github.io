// ============================================================
// 校园视频存储 — IndexedDB 封装（零后端）
// 视频以 Blob 原文件存储；记录结构：
//   { id, slug, title, blob, size, createdAt }
// localStorage 容量不足存视频（~5MB），IndexedDB 可达数百 MB。
// ============================================================

const DB_NAME = 'cx-videos'
const STORE = 'videos'
const VERSION = 1

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024   // 50MB

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// 新增视频记录
export async function addVideo(record) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add(record)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

// 某学校的视频列表（按时间倒序）
export async function listVideos(slug) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const list = req.result
        .filter(v => v.slug === slug)
        .sort((a, b) => b.createdAt - a.createdAt)
      db.close()
      resolve(list)
    }
    req.onerror = () => { db.close(); reject(req.error) }
  })
}

// 删除视频
export async function deleteVideo(id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}
