import React from "react";
import CodeCopyBtn from "./CodeCopyBtn";

export default function PreComponent(props) {
    return (
        <pre className="blog-pre">
        <CodeCopyBtn>{props.children}</CodeCopyBtn>
            {props.children}
    </pre>
    )
}