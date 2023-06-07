import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {a11yDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import CodeCopyBtn from './CodeCopyBtn';

export default function PostBody({content}) {
    // Add the CodeCopyBtn component to our PRE element
    const Pre = ({children}) => <pre className="blog-pre">
        <CodeCopyBtn>{children}</CodeCopyBtn>
        {children}
    </pre>

    const Blockquote = ({children}) => <blockquote>
        {children}
    </blockquote>

    const UlComponent = (props) => <ul className="list-disc pl-4 list-[revert]">{props.children}</ul>

    const tableComponent = (props) => <table style={{borderCollapse: "separate", borderSpacing: "0"}}>{props.children}</table>
    const thComponent = (props) => <th className="border border-slate-500 bg-gray-400 p-2">{props.children}</th>
    const tdComponent = (props) => <td className="border border-slate-500 p-2">{props.children}</td>

    return (
        <ReactMarkdown
            className='post-markdown markdown'
            linkTarget='_blank'
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
                blockquote: Blockquote,
                pre: Pre,
                ul: UlComponent,
                th: thComponent,
                td: tdComponent,
                table: tableComponent,
                code({
                         node,
                         inline,
                         className = "text-blue-600 rounded font-semibold bg-blue-100 p-1",
                         children,
                         ...props
                     }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                        <SyntaxHighlighter
                            style={a11yDark}
                            language={match ? match[1] : null}
                            PreTag="div"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    )
                }
            }}
        >
            {content}
        </ReactMarkdown>
    )
}
