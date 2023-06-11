import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import HeaderComponent from "./HeaderComponent";
import TableComponent from "./TableComponent";
import ThComponent from "./ThComponent";
import TdComponent from "./TdComponent";
import UlComponent from "./UlComponent";
import PreComponent from "./PreComponent";
import CodeComponent from "./CodeComponent";

export default function PostBody({content}) {
    return (
        <ReactMarkdown
            className='post-markdown markdown'
            linkTarget='_blank'
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
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
    )
}
