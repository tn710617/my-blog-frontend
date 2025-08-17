import React from "react";
import CodeCopyBtn from "./CodeCopyBtn";
import MermaidComponent from "./MermaidComponent";
import PostBody from "./PostBody";
import {useAuthStore} from "../../stores";

export default function PreComponent(props = {}) {
    const childrenArray = React.Children.toArray(props?.children)
    const firstChild = childrenArray[0]
    const className = firstChild?.props?.className || ''
    const match = /language-(\w+)/.exec(className)
    const language = match ? match[1] : null
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

    if (language === "mermaid") {
        const mermaidCode = (firstChild?.props?.children?.[0])
        return <MermaidComponent>{mermaidCode}</MermaidComponent>
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
            <PostBody content={firstChild?.props?.children?.[0]} />
        )
    }

    return (
        <pre className="blog-pre">
            <CodeCopyBtn>{props.children}</CodeCopyBtn>
            {props.children}
        </pre>
    )
}