import React, {Suspense, lazy} from "react";
import CodeCopyBtn from "./CodeCopyBtn";
import PostBody from "./PostBody";
import {useAuthStore} from "../../stores";

// Lazy load MermaidComponent - only loads when mermaid code blocks are encountered
const MermaidComponent = lazy(() => import("./MermaidComponent"));

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
        return (
            <Suspense fallback={
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-600">Loading diagram renderer...</span>
                    </div>
                </div>
            }>
                <MermaidComponent>{codeContent}</MermaidComponent>
            </Suspense>
        )
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
            <PostBody content={codeContent}/>
        )
    }

    return (
        <pre className="blog-pre">
            <CodeCopyBtn>{props.children}</CodeCopyBtn>
            {props.children}
        </pre>
    )
}