import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import HeaderComponent from "./HeaderComponent";
import TableComponent from "./TableComponent";
import ThComponent from "./ThComponent";
import TdComponent from "./TdComponent";
import UlComponent from "./UlComponent";
import PreComponent from "./PreComponent";
import CodeComponent from "./CodeComponent";
import ImgComponent from "./ImgComponent";
import AComponent from "./AComponent";

export default function PostBody({content}) {
    const intl = useIntl();

    // Memoize contentWithToc to only update when content or locale changes
    const contentWithToc = useMemo(() => {
        // Check if content has headings (any h2-h6 markers, excluding h1)
        const hasHeadings = /^#{2,6}\s+/m.test(content);

        if (!hasHeadings) return content;

        // Determine which heading to use based on locale
        const tocHeading = intl.locale === 'zh-TW' ? '## 目錄' : '## Table of Contents';

        // Prepend the appropriate heading for remark-toc to process
        return `${tocHeading}\n\n${content}`;
    }, [content, intl.locale]);

    return (
        <div className='markdown'>
            <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeAutolinkHeadings]}
            remarkPlugins={[remarkGfm, [remarkToc, {heading: '(table[ -]of[ -])?contents?|toc|目錄'}]]}
            components={{
                a: AComponent,
                img: ImgComponent,
                pre: PreComponent,
                ul: UlComponent,
                th: ThComponent,
                td: TdComponent,
                h2: HeaderComponent,
                h3: HeaderComponent,
                h4: HeaderComponent,
                h5: HeaderComponent,
                h6: HeaderComponent,
                table: TableComponent,
                code: CodeComponent
            }}
        >
            {contentWithToc}
        </ReactMarkdown>
        </div>
    )
}
