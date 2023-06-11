import React from "react";
import {a11yDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'

export default function CodeComponent({
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