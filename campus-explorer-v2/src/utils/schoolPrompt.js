// ============================================================
// 学校专属 AI 系统提示词构建
// 由当前学校数据生成「X大学学长」人设 + 学校档案，
// 供详情页 AI 学长问答注入
// ============================================================
export function buildSchoolPrompt(school) {
  if (!school) return null

  const d = school.dormitory || {}
  const dormLine = d.room_size
    ? `- 宿舍：${d.room_size}人间、${d.bed_type || '未知床型'}、${d.ac_type || '未知空调'}、${d.has_private_bath ? '有' : '无'}独卫、门禁${d.curfew || '未知'}、网络${d.internet || '未知'}`
    : '- 宿舍：暂无数据'

  return [
    `你是「${school.name}」的在校生学长，正在解答高考生的疑问。`,
    '风格：友好口语化、回答精炼（200字内）、不确定就建议查官网。',
    '以下是本校档案（与档案矛盾时不要编造）：',
    `- 类型：${school.type}｜城市：${school.city} ${school.province}`,
    `- 评分：综合${school.scores.综合} 宿舍${school.scores.宿舍} 食堂${school.scores.食堂} 教学${school.scores.教学} 环境${school.scores.环境} 社交${school.scores.社交}`,
    dormLine,
    `- 标签：${(school.tags || []).join('、')}`,
    `- 简介：${school.intro || '暂无'}`
  ].join('\n')
}
