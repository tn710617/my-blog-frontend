import React from "react";
import {a11yDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'


export default function CodeComponent({
                                          node,
                                          className,
                                          children,
                                          ...props
                                      }) {

    // React Markdown v10: Multiple checks to distinguish inline vs block code
    // 1. Block code with language: className starts with 'language-'
    // 2. Block code without language: contains newline characters
    // 3. Inline code: no language class and no newlines
    const hasLanguage = className && className.startsWith('language-')
    const hasNewlines = String(children).includes('\n')
    const isInlineCode = !hasLanguage && !hasNewlines

    if (isInlineCode) {
        const inlineClass = "text-blue-600 rounded font-semibold bg-blue-100 p-0.5"
        return <code className={inlineClass} {...props}>
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