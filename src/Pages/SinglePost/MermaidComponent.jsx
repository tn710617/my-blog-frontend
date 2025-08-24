import React, {useCallback, useEffect, useState} from "react";
import {uniqueId} from "lodash";

export default function MermaidComponent({children}) {
    const markId = React.useRef(`mark${uniqueId()}`)
    const [transformCode, setTransformCode] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    const renderMermaid = useCallback(async (string) => {
        try {
            setIsLoading(true)
            // Dynamic import of mermaid - only loads when needed
            const mermaid = (await import("mermaid")).default
            const {svg} = await mermaid.render(markId.current, children)
            setTransformCode(svg)
        } catch (error) {
            console.error('Mermaid rendering failed:', error)
            setTransformCode('<div class="error text-red-500 p-4 border border-red-300 rounded">Failed to render Mermaid diagram</div>')
        } finally {
            setIsLoading(false)
        }
    }, [children])

    useEffect(() => {
        renderMermaid(children)
    }, [children, renderMermaid])

    return <div dangerouslySetInnerHTML={{__html: transformCode}}/>
}