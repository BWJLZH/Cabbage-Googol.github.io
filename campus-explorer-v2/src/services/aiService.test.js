import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildBody, fetchAIResponse, fetchAIResponseStream } from './aiService.js'

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

// ============================================================
// options.systemPrompt 透传链路
// ============================================================
function stubFetchWithJson(json) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => json
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('fetchAIResponse options 透传', () => {
  it('自定义 systemPrompt 写入请求体', async () => {
    const fetchMock = stubFetchWithJson({ choices: [{ message: { content: 'hi' } }] })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchAIResponse([{ role: 'user', content: '你好' }], { systemPrompt: '你是清华学长' })
    expect(result).toBe('hi')

    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.messages[0].content).toBe('你是清华学长')
    expect(body.stream).toBe(false)
  })

  it('不传 options 时使用默认提示词', async () => {
    const fetchMock = stubFetchWithJson({ choices: [{ message: { content: 'hi' } }] })
    vi.stubGlobal('fetch', fetchMock)

    await fetchAIResponse([{ role: 'user', content: '你好' }])
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.messages[0].content).toContain('校园搜')
  })
})

describe('fetchAIResponseStream options 透传', () => {
  it('自定义 systemPrompt 写入流式请求体并正常消费流', async () => {
    const encoder = new TextEncoder()
    const fetchMock = vi.fn(async () => ({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"你好"}}]}\n\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      })
    }))
    vi.stubGlobal('fetch', fetchMock)

    const stream = await fetchAIResponseStream([{ role: 'user', content: '你好' }], { systemPrompt: '你是清华学长' })
    const chunks = []
    for await (const c of stream) chunks.push(c)

    expect(chunks.join('')).toBe('你好')
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.messages[0].content).toBe('你是清华学长')
    expect(body.stream).toBe(true)
  })
})
