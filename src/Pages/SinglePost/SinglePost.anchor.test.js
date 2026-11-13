/* eslint-disable import/first */
import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {IntlProvider} from 'react-intl'
import {MemoryRouter} from 'react-router'
import {http, HttpResponse} from 'msw'
import {server} from '../../mocks/server'
import en from '../../locales/en.json'

import SinglePost from '.'

// 真的 PostBody(react-markdown + rehype-slug):標題的 id 由內容產生,網址帶的錨點要對得上它
const content = [
    'Intro paragraph.',
    '## # Preface',
    'Some text.',
    '## # Complete Deployment Architecture',
    'The part we want to land on.',
].join('\n\n')

const renderAt = (path) => {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}})
    return render(
        <IntlProvider locale="en" messages={en}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[path]}>
                    <SinglePost/>
                </MemoryRouter>
            </QueryClientProvider>
        </IntlProvider>
    )
}

describe('SinglePost — landing on a section anchor', () => {
    let scrollIntoView

    beforeEach(() => {
        scrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = scrollIntoView
        server.use(
            http.get('*/posts/:id', ({params}) => HttpResponse.json({
                data: {
                    id: params.id, post_title: 'Anchor Post', post_content: content,
                    category_id: 1, category: {category_name: 'general'}, tags: [],
                    created_at: '2024-01-01', updated_at: '2024-01-02', is_public: true, locale: 'en',
                },
            })),
        )
    })

    afterEach(() => {
        delete Element.prototype.scrollIntoView
    })

    it('scrolls the heading named by the hash into view once the content has loaded', async () => {
        renderAt('/single-post?post_id=488#-complete-deployment-architecture')

        const heading = await screen.findByRole('heading', {name: '# Complete Deployment Architecture'})
        expect(heading).toHaveAttribute('id', '-complete-deployment-architecture')
        await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
        expect(scrollIntoView.mock.contexts.at(-1)).toBe(heading)
    })

    it('decodes a percent-encoded (Chinese) anchor', async () => {
        server.use(
            http.get('*/posts/:id', ({params}) => HttpResponse.json({
                data: {
                    id: params.id, post_title: '錨點文章', post_content: '## # 前言\n\n文字\n\n## # 完整的部署架構\n\n要停的那一段',
                    category_id: 1, category: {category_name: 'general'}, tags: [],
                    created_at: '2024-01-01', updated_at: '2024-01-02', is_public: true, locale: 'zh-TW',
                },
            })),
        )
        renderAt(`/single-post?post_id=487#${encodeURIComponent('-完整的部署架構')}`)

        const heading = await screen.findByRole('heading', {name: '# 完整的部署架構'})
        await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
        expect(scrollIntoView.mock.contexts.at(-1)).toBe(heading)
    })

    it('re-aligns when late images grow the page, and stops once the reader scrolls', async () => {
        // jsdom 沒有 ResizeObserver;換一個能手動觸發的
        let notifyResize
        const disconnect = vi.fn()
        globalThis.ResizeObserver = class {
            constructor(callback) { notifyResize = callback }
            observe() {}
            disconnect() { disconnect() }
        }
        try {
            renderAt('/single-post?post_id=488#-complete-deployment-architecture')
            await screen.findByRole('heading', {name: '# Complete Deployment Architecture'})
            await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))

            notifyResize()   // 圖片載入、版面變高
            expect(scrollIntoView).toHaveBeenCalledTimes(2)

            window.dispatchEvent(new Event('wheel'))   // 讀者自己捲了
            expect(disconnect).toHaveBeenCalled()
        } finally {
            delete globalThis.ResizeObserver
        }
    })

    it('does not scroll when the URL has no hash', async () => {
        renderAt('/single-post?post_id=488')

        await screen.findByRole('heading', {name: '# Complete Deployment Architecture'})
        // 給任何延遲的捲動一點時間發生,再斷言它沒有發生
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(scrollIntoView).not.toHaveBeenCalled()
    })
})
