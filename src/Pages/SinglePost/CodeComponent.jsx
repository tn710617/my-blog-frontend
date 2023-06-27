import React from "react";
import {a11yDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'


export default function CodeComponent({
                                          node,
                                          inline,
                                          className = "text-blue-600 rounded font-semibold bg-blue-100 p-0.5",
                                          children,
                                          ...props
                                      }) {

    if (inline) {
        return <code className={className} {...props}>
            {children}
        </code>
    }

    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : null

    return (
        <SyntaxHighlighter
            style={a11yDark}
            language={language}
            PreTag="div"
            {...props}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    )
}