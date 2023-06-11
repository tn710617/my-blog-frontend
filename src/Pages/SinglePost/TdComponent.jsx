import React from "react";

export default function TdComponent(props) {
    return (
        <td className="border border-slate-500 bg-gray-400 p-2">{props.children}</td>
    )
}