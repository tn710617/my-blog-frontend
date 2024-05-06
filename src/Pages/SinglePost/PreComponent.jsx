import React from "react";
import CodeCopyBtn from "./CodeCopyBtn";
import MermaidComponent from "./MermaidComponent";
import PostBody from "./PostBody";
import {useRecoilState} from "recoil";
import loginAtom from "../../States/loginAtom";

export default function PreComponent(props) {
    const className = props?.children[0]?.props?.className
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : null
    const [isLoggedIn] = useRecoilState(loginAtom)

    if (language === "mermaid") {
        const mermaidCode = (props.children[0].props.children[0])
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
            <PostBody content={props.children[0].props.children[0]} />
        )
    }

    return (
        <pre className="blog-pre">
        <CodeCopyBtn>{props.children}</CodeCopyBtn>
            {props.children}
    </pre>
    )
}