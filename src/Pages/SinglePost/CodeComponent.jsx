import React, {useEffect} from "react";
import {a11yDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import mermaid from "mermaid"


export default function CodeComponent({
                                          node,
                                          inline,
                                          className = "text-blue-600 rounded font-semibold bg-blue-100 p-1",
                                          children,
                                          ...props
                                      }) {
    useEffect(() => {
        mermaid.contentLoaded()
    }, [])

    if (inline) {
        return <code className={className} {...props}>
            {children}
        </code>
    }

    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : null

    if (language === "mermaid") {
        return <div className={"mermaid rounded"}>{children[0]}</div>
    }

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