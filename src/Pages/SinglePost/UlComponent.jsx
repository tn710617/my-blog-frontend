import React from "react";

export default function UlComponent(props) {
    return (
        <ul className="list-disc pl-4 list-[revert]">{props.children}</ul>
    )
}