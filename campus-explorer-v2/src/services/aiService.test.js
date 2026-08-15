import { describe, it, expect } from 'vitest'
import { buildBody } from './aiService.js'

describe('buildBody', () => {
  it('不传 systemPrompt 时使用默认配置提示词', () => {
    const body = buildBody([{ role: 'user', content: '你好' }], false)
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content).toContain('校园搜')
    expect(body.stream).toBe(false)
    expect(body.messages[1]).toEqual({ role: 'user', content: '你好' })
  })

  it('传入自定义 systemPrompt 时覆盖默认提示词', () => {
    const body = buildBody([], true, '你是清华学长')
    expect(body.messages[0].content).toBe('你是清华学长')
    expect(body.stream).toBe(true)
  })
})
