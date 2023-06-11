import React from "react";

export default function TableComponent(props) {
    return (
        <table
            style={{borderCollapse: "separate", borderSpacing: "0"}}>{props.children}</table>
    )

}