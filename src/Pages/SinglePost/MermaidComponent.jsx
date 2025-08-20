import React, {useCallback, useEffect} from "react";
import mermaid from "mermaid";
import {uniqueId} from "lodash";

export default function MermaidComponent({children}) {
    const markId = React.useRef(`mark${uniqueId()}`)
    const [transformCode, setTransformCode] = React.useState("")

    const renderMermaid = useCallback(async (string) => {
        try {
            const {svg} = await mermaid.render(markId.current, children)
            setTransformCode(svg)
        } catch (error) {
            console.error('Mermaid rendering failed:', error)
            setTransformCode('<div class="error text-red-500 p-4 border border-red-300 rounded">Failed to render Mermaid diagram</div>')
        }
    }, [children])

    useEffect(() => {
        renderMermaid(children)
    }, [children, renderMermaid])

    return <div dangerouslySetInnerHTML={{__html: transformCode}}/>
}