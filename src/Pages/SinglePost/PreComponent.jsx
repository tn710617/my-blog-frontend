import React from "react";
import CodeCopyBtn from "./CodeCopyBtn";
import MermaidComponent from "./MermaidComponent";

export default function PreComponent(props) {
    const className = props?.children[0]?.props?.className
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : null

    if (language === "mermaid") {
        const mermaidCode = (props.children[0].props.children[0])
        return <MermaidComponent>{mermaidCode}</MermaidComponent>
    }
    return (
        <pre className="blog-pre">
        <CodeCopyBtn>{props.children}</CodeCopyBtn>
            {props.children}
    </pre>
    )
}