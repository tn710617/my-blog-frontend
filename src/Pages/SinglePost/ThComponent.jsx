import React from "react";

export default function ThComponent(props) {
    return (
        <th className="border border-slate-500 bg-gray-400 p-2">{props.children}</th>
    )
}