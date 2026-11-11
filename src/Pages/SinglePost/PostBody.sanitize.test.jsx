import React from 'react'
import { render } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { MemoryRouter } from 'react-router'
import en from '../../locales/en.json'
import PostBody from './PostBody'

const renderBody = (content) => render(
  <IntlProvider locale="en" messages={en}>
    <MemoryRouter>
      <PostBody content={content} />
    </MemoryRouter>
  </IntlProvider>
)

describe('PostBody sanitizes raw HTML in post content (決策 9-1)', () => {
  it('drops script tags and event-handler attributes', () => {
    const { container } = renderBody(
      'before <script>window.pwned = 1</script> after\n\n<img src="https://example.com/a.png" onerror="window.pwned = 2">\n\n<p onclick="window.pwned = 3">text</p>'
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.innerHTML).not.toContain('pwned')
    expect(container.querySelector('[onerror]')).toBeNull()
    expect(container.querySelector('[onclick]')).toBeNull()
    expect(container.textContent).toContain('before')
    expect(container.textContent).toContain('after')
    expect(container.textContent).toContain('text')
  })

  it('keeps img and br', () => {
    const { container } = renderBody('line one<br>line two\n\n<img src="https://example.com/a.png" alt="pic">')
    expect(container.querySelector('br')).not.toBeNull()
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img.getAttribute('src')).toBe('https://example.com/a.png')
  })

  it('strips javascript: links but keeps http(s), mailto and fragment links', () => {
    const { container } = renderBody(
      '<a href="javascript:alert(1)">js</a> <a href="https://example.com/">https</a> <a href="mailto:a@b.c">mail</a> <a href="#frag">frag</a>'
    )
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(hrefs).not.toContain('javascript:alert(1)')
    expect(hrefs).toEqual(expect.arrayContaining(['https://example.com/', 'mailto:a@b.c', '#frag']))
    expect(container.textContent).toContain('js')
  })

  it('keeps links whose scheme is written in upper case (post 143 uses Https://)', () => {
    const { container } = renderBody('<a href="Https://example.com/">mixed case</a>')
    expect(container.querySelector('a').getAttribute('href')).toBe('https://example.com/')
  })

  it('keeps YouTube embeds only and drops other iframes, link and style tags', () => {
    const { container } = renderBody(
      '<iframe src="https://www.youtube.com/embed/abc" title="yt" allowfullscreen></iframe>\n\n<iframe src="https://evil.example/"></iframe>\n\n<link rel="stylesheet" href="https://evil.example/x.css">\n\n<style>body{display:none}</style>'
    )
    const iframes = [...container.querySelectorAll('iframe')].map((f) => f.getAttribute('src'))
    expect(iframes).toEqual(['https://www.youtube.com/embed/abc'])
    expect(container.querySelector('link')).toBeNull()
    expect(container.querySelector('style')).toBeNull()
    expect(container.innerHTML).not.toContain('display:none')
  })

  it('keeps the inline styles existing posts rely on (div / img / aside)', () => {
    const { container } = renderBody(
      '<div style="display: flex"><img src="https://example.com/a.png" style="width: 100%"></div>\n\n<aside style="background-color: red">note</aside>'
    )
    expect(container.querySelector('div[style]')).not.toBeNull()
    expect(container.querySelector('img[style]')).not.toBeNull()
    expect(container.querySelector('aside[style]')).not.toBeNull()
  })

  it('keeps GFM task lists, tables, code blocks and mermaid fences', () => {
    const { container } = renderBody(
      '- [x] done\n- [ ] todo\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = 1\n```\n'
    )
    const boxes = container.querySelectorAll('input[type="checkbox"]')
    expect(boxes).toHaveLength(2)
    expect(boxes[0].checked).toBe(true)
    expect(container.querySelector('table')).not.toBeNull()
    expect(container.textContent).toContain('const x = 1')
  })
})
