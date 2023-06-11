import React from "react";

export default function AComponent(props) {
    return (
        <a {...props} className={"underline text-blue-600 hover:text-blue-800 visited:text-purple-600"}>
            {props.children}
        </a>
    )
}