import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
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
    return (
        <div className='markdown'>
            <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeAutolinkHeadings]}
            remarkPlugins={[remarkGfm]}
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
            {content}
        </ReactMarkdown>
        </div>
    )
}
