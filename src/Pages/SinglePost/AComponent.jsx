import React from "react";

export default function AComponent(incomingProps = {}) {
    const { children, ...rest } = incomingProps || {}
    return (
        <a
            {...rest}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
            {children}
        </a>
    )
}
