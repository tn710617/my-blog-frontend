import React, {useCallback, useEffect} from "react";
import mermaid from "mermaid";
import {uniqueId} from "lodash";

export default function MermaidComponent({children}) {
    const markId = React.useRef(`mark${uniqueId()}`)
    const [transformCode, setTransformCode] = React.useState("")

    const renderMermaid = useCallback(async (string) => {
        const {svg} = await mermaid.render(markId.current, children)
        setTransformCode(svg)
    }, [children])

    useEffect(() => {
        renderMermaid(children)
    }, [children, renderMermaid])

    return <div dangerouslySetInnerHTML={{__html: transformCode}}/>
}