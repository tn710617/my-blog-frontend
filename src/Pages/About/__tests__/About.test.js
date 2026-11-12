/* eslint-disable import/first */
import React from 'react'
import {render, screen, within, fireEvent} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {IntlProvider} from 'react-intl'
import {MemoryRouter, Route, Routes} from 'react-router'
import {http, HttpResponse} from 'msw'
import {server} from '../../../mocks/server'
import en from '../../../locales/en.json'
import zhTW from '../../../locales/zh-TW.json'
import portfolioData from '../portfolioData.json'
import {getWorkExperiencesEn} from '../WorkExperiencesEn'
import {skillGroups, sections} from '../aboutData'

// Email 還沒定(票 10 QUESTION.md Q1),測試給一個假的,驗頁面有把它做成 mailto
vi.mock('../aboutData', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        getContacts: () => ({
            email: 'me@example.test',
            linkedin: 'https://linkedin.example.test/in/me',
            medium: 'https://medium.example.test/@me',
        }),
    }
})

import About from '..'

// 文章年表:兩年、共 7 篇;每年的 article_count 加總就是頁上的篇數
const groupedPosts = {
    '2023': {
        article_count: 3,
        months: {
            '10': {
                article_count: 3, month_name: 'Oct', posts: [
                    {id: 3, post_title: 'Old post C', locale: 'English', date: '20', month: 'Oct'},
                    {id: 2, post_title: 'Old post B', locale: 'English', date: '10', month: 'Oct'},
                    {id: 1, post_title: 'Old post A', locale: 'English', date: '01', month: 'Oct'},
                ],
            },
        },
    },
    '2024': {
        article_count: 4,
        months: {
            '01': {
                article_count: 1, month_name: 'Jan', posts: [
                    {id: 4, post_title: 'January post', locale: 'English', date: '05', month: 'Jan'},
                ],
            },
            '09': {
                article_count: 3, month_name: 'Sep', posts: [
                    {id: 7, post_title: 'Newest post', locale: 'English', date: '30', month: 'Sep'},
                    {id: 6, post_title: 'Second newest', locale: 'English', date: '15', month: 'Sep'},
                    {id: 5, post_title: 'Third newest', locale: 'English', date: '02', month: 'Sep'},
                ],
            },
        },
    },
}

// 技能分組名單裡的標籤,加一個不在名單裡的
const listedTagNames = skillGroups.flatMap(g => g.tags)
const tags = [
    ...listedTagNames.map((name, i) => ({id: 100 + i, tag_name: name})),
    {id: 999, tag_name: 'Unlisted Tag'},
]

beforeEach(() => {
    server.use(
        http.get('*/grouped-posts', () => HttpResponse.json({data: groupedPosts})),
        http.get('*/tags', () => HttpResponse.json({data: tags})),
    )
})

const renderAbout = (locale = 'en') => {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}})
    return render(
        <IntlProvider locale={locale} messages={locale === 'en' ? en : zhTW}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/about']}>
                    <Routes>
                        <Route path="/about" element={<About/>}/>
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        </IntlProvider>
    )
}

const section = (id) => document.getElementById(id)

describe('About page', () => {
    it('shows every section without any click, and has no show/hide toggle', async () => {
        renderAbout('en')

        // 頂部定位
        expect(screen.getByText(en['about.position'])).toBeInTheDocument()
        // 五個區塊各有標題與至少一筆內容
        expect(within(section('intro')).getByText(en['about.intro.distributed.title'])).toBeInTheDocument()
        expect(within(section('experience')).getByText(getWorkExperiencesEn()[0].title)).toBeInTheDocument()
        expect(within(section('portfolio')).getByText(portfolioData.en[0].title)).toBeInTheDocument()
        expect(await within(section('skills')).findByRole('link', {name: 'Laravel'})).toBeInTheDocument()
        expect(await within(section('posts')).findByText('Newest post')).toBeInTheDocument()

        expect(screen.queryByRole('button', {name: /^\(?\s*(show|hide)\s*\)?$/i})).not.toBeInTheDocument()
        expect(screen.queryByText(/^\(?\s*(show|hide)\s*\)?$/i)).not.toBeInTheDocument()
    })

    it('has no show/hide toggle in zh-TW either', async () => {
        renderAbout('zh-TW')
        await within(section('posts')).findByText('Newest post')
        expect(screen.queryByText(/^\(?\s*(顯示|隱藏)\s*\)?$/)).not.toBeInTheDocument()
    })

    it('header has name, title, position, three contact links, stats and no GitHub', async () => {
        renderAbout('en')

        expect(screen.getByText(en['about.name'])).toBeInTheDocument()
        expect(screen.getByText(en['about.job_title'])).toBeInTheDocument()
        expect(screen.getByRole('link', {name: /email/i})).toHaveAttribute('href', 'mailto:me@example.test')
        expect(screen.getByRole('link', {name: /linkedin/i})).toHaveAttribute('href', 'https://linkedin.example.test/in/me')
        expect(screen.getByRole('link', {name: /medium/i})).toHaveAttribute('href', 'https://medium.example.test/@me')

        // 篇數 = 各年 article_count 加總(3 + 4)
        expect(await screen.findByText('7 articles')).toBeInTheDocument()
        expect(screen.getByText('Writing since 2023')).toBeInTheDocument()
        expect(screen.getByText(`${getWorkExperiencesEn().length} positions`)).toBeInTheDocument()
        expect(screen.getByText(`${portfolioData.en.length} projects`)).toBeInTheDocument()

        expect(screen.queryByText(/github/i)).not.toBeInTheDocument()
        document.querySelectorAll('a').forEach(a => {
            expect(a.getAttribute('href') ?? '').not.toMatch(/github/i)
        })
    })

    it('intro is four claims, each with 2-3 evidence links pointing at a section anchor', () => {
        renderAbout('en')

        const claims = within(section('intro')).getAllByRole('listitem', {name: /.+/})
        expect(claims).toHaveLength(4)
        claims.forEach(claim => {
            const links = within(claim).getAllByRole('link')
            expect(links.length).toBeGreaterThanOrEqual(2)
            expect(links.length).toBeLessThanOrEqual(3)
            links.forEach(link => {
                expect(link.getAttribute('href')).toMatch(/^\/single-post\?post_id=\d+#.+/)
            })
        })
    })

    it('each experience shows at most 4 highlights, the rest behind "see full details"', () => {
        renderAbout('en')

        const experiences = getWorkExperiencesEn()
        const items = within(section('experience')).getAllByRole('article')
        expect(items).toHaveLength(experiences.length)

        items.forEach((item, index) => {
            expect(within(item).getByText(experiences[index].period)).toBeInTheDocument()
            expect(within(item).getByText(experiences[index].work_company_name)).toBeInTheDocument()
            const highlights = within(item).getAllByRole('listitem')
            expect(highlights.length).toBeGreaterThanOrEqual(3)
            expect(highlights.length).toBeLessThanOrEqual(4)
        })

        // 第一段的細項(例:Nginx Buffer 那一條)預設看不到,點了才出現
        const first = items[0]
        expect(within(first).queryByText(/Nginx/)).not.toBeInTheDocument()
        fireEvent.click(within(first).getByRole('button', {name: en['about.experience.show_details']}))
        expect(within(first).getByText(/Nginx/)).toBeInTheDocument()
    })

    it('portfolio has one card per project, each with a sentence and tech tags, linking to its article', () => {
        renderAbout('en')

        const cards = within(section('portfolio')).getAllByRole('link')
        expect(cards).toHaveLength(portfolioData.en.length)
        cards.forEach((card, index) => {
            const project = portfolioData.en[index]
            expect(card).toHaveAttribute('href', `/single-post?post_id=${project.post_id}`)
            expect(within(card).getByText(project.summary)).toBeInTheDocument()
            expect(project.tags.length).toBeGreaterThan(0)
            project.tags.forEach(tag => expect(within(card).getByText(tag)).toBeInTheDocument())
        })
    })

    it('skills are static groups of clickable tags leading to that tag\'s articles, without counts', async () => {
        renderAbout('en')
        const skills = section('skills')

        skillGroups.forEach(group => {
            expect(within(skills).getByRole('heading', {name: en[`about.skills.group.${group.id}`]})).toBeInTheDocument()
        })
        const laravel = await within(skills).findByRole('link', {name: 'Laravel'})
        // 點標籤導向帶該標籤的文章列表:首頁從網址的 tags 讀標籤(src/Pages/Posts/index.jsx)
        const laravelId = tags.find(t => t.tag_name === 'Laravel').id
        expect(laravel).toHaveAttribute('href', `/?tags=${laravelId}`)

        // 不在名單內的標籤收在「全部標籤」
        expect(within(skills).queryByRole('link', {name: 'Unlisted Tag'})).not.toBeInTheDocument()
        fireEvent.click(within(skills).getByRole('button', {name: en['about.skills.all_tags']}))
        expect(within(skills).getByRole('link', {name: 'Unlisted Tag'})).toBeInTheDocument()

        // 不顯示篇數
        expect(skills.textContent).not.toMatch(/\d+\s*(articles?|篇)/i)
    })

    it('article timeline lists the total, exactly the latest 5 posts as links, and a see-all entry', async () => {
        renderAbout('en')
        const posts = section('posts')

        expect(await within(posts).findByText('7 articles in total')).toBeInTheDocument()
        const list = within(posts).getByRole('list')
        const items = within(list).getAllByRole('link')
        expect(items).toHaveLength(5)
        expect(items.map(a => a.textContent)).toEqual([
            expect.stringContaining('Newest post'),
            expect.stringContaining('Second newest'),
            expect.stringContaining('Third newest'),
            expect.stringContaining('January post'),
            expect.stringContaining('Old post C'),
        ])
        expect(items[0]).toHaveAttribute('href', '/single-post?post_id=7')
        expect(within(posts).getByRole('link', {name: new RegExp(`^${en['about.posts.view_all']}`)})).toHaveAttribute('href', '/')
    })

    it('section nav links point at each section anchor', () => {
        renderAbout('en')
        const nav = screen.getByRole('navigation', {name: en['about.nav.label']})
        const links = within(nav).getAllByRole('link')
        expect(links.map(a => a.getAttribute('href'))).toEqual(sections.map(id => `#${id}`))
        sections.forEach(id => expect(section(id)).not.toBeNull())
    })

    it('en shows no Chinese characters; zh-TW shows section titles in Chinese and no hard-coded English UI strings', async () => {
        const {unmount} = renderAbout('en')
        await within(section('posts')).findByText('Newest post')
        await within(section('skills')).findByRole('link', {name: 'Laravel'})
        expect(screen.getByText(en['about.intro.section_title'])).toBeInTheDocument()
        expect(document.body.textContent).not.toMatch(/[㐀-鿿]/)
        unmount()

        renderAbout('zh-TW')
        await within(section('posts')).findByText('Newest post')
        ;['about.intro.section_title', 'about.work_experience_title', 'about.portfolio', 'about.skill', 'about.posts_history']
            .forEach(id => expect(within(document.body).getAllByText(zhTW[id]).length).toBeGreaterThan(0))
        expect(document.body.textContent).not.toMatch(/show (more|less) tags/i)
    })
})
