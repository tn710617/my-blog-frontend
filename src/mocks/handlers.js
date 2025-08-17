import { rest } from 'msw'

export const handlers = [
  // Categories list
  rest.get('*/categories', (req, res, ctx) => {
    const categories = [
      { id: 1, category_name: 'general', category_description: 'General topics' },
      { id: 2, category_name: 'tech', category_description: 'Technology' },
    ]
    return res(ctx.status(200), ctx.json({ data: categories }))
  }),

  // Posts index with paging
  rest.get('*/posts', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') || '1')
    const postsPage1 = [
      { id: 101, post_title: 'MSW Post 1', post_content: 'Content 1', category_id: 1, category: { category_name: 'general' }, tags: [], created_at: '2024-01-01', updated_at: '2024-01-02', is_public: true },
      { id: 102, post_title: 'MSW Post 2', post_content: 'Content 2', category_id: 2, category: { category_name: 'tech' }, tags: [], created_at: '2024-01-03', updated_at: '2024-01-04', is_public: true },
    ]
    const postsPage2 = [
      { id: 201, post_title: 'MSW Post 3', post_content: 'Content 3', category_id: 1, category: { category_name: 'general' }, tags: [], created_at: '2024-02-01', updated_at: '2024-02-02', is_public: true },
    ]
    const data = page === 2 ? postsPage2 : postsPage1
    const meta = { current_page: page, last_page: 2, per_page: 10, total: postsPage1.length + postsPage2.length }
    return res(ctx.status(200), ctx.json({ data, meta }))
  }),
  // Tags (used by Create/Edit pages and some components)
  rest.get('*/tags', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: [] }))
  }),

  // Single post show
  rest.get('*/posts/:id', (req, res, ctx) => {
    const { id } = req.params
    const post = { id, post_title: `MSW Show Post ${id}`, post_content: 'Body', category_id: 1, category: { category_name: 'general' }, tags: [], created_at: '2024-01-01', updated_at: '2024-01-02', is_public: true, locale: 'en' }
    return res(ctx.status(200), ctx.json({ data: post }))
  }),

  // Auth check
  rest.get('*/is-logged-in', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: 'ok' }))
  }),
]
