import React from "react";
import CodeCopyBtn from "./CodeCopyBtn";
import MermaidComponent from "./MermaidComponent";
import PostBody from "./PostBody";
import {useAuthStore} from "../../stores";

export default function PreComponent(props = {}) {
    // React Markdown 10.0 compatibility: 
    // In v10, pre contains code element with className, need to access it properly
    const childrenArray = React.Children.toArray(props?.children)
    const codeElement = childrenArray[0]
    
    // Get className from the code element inside pre
    const className = codeElement?.props?.className || ''
    const match = /language-(\w+)/.exec(className)
    const language = match ? match[1] : null
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    
    // Get the actual code content from the code element
    const codeContent = codeElement?.props?.children || ''

    if (language === "mermaid") {
        return <MermaidComponent>{codeContent}</MermaidComponent>
    }

    // render the secret code
    if (language === "secret") {
        if (!isLoggedIn) {
            return (
                <>
                </>
            )
        }

        return (
            <PostBody content={codeContent} />
        )
    }

    return (
        <pre className="blog-pre">
            <CodeCopyBtn>{props.children}</CodeCopyBtn>
            {props.children}
        </pre>
    )
}