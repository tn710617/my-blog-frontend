import React, {useEffect} from "react";
import {FaCopy} from "react-icons/fa";
import {FaCheckSquare} from "react-icons/fa";

export default function CodeCopyBtn({children}) {
    const [copyOk, setCopyOk] = React.useState(false);

    const icon = copyOk ? <FaCheckSquare className="text-white"/> : <FaCopy/>;

    const extractText = (nodes) => {
        if (nodes == null) return ''
        if (typeof nodes === 'string') return nodes
        const arr = React.Children.toArray(nodes)
        return arr.map((n) => {
            if (typeof n === 'string') return n
            if (n && n.props && n.props.children) return extractText(n.props.children)
            return ''
        }).join('')
    }

    useEffect(() => {
        if (copyOk === false) return

        const text = extractText(children).trim()
        if (text.length > 0) {
            navigator.clipboard.writeText(text)
        }

        const timeoutId = setTimeout(() => {
            setCopyOk(false);
        }, 1000);

        return () => clearTimeout(timeoutId)
    }, [children, copyOk])

    return (
        <div
            className="text-white absolute right-2 top-3 text-2xl cursor-pointer transition-all duration-300 ease-in-out hover:transform hover:scale-110 hover:opacity-90">
            <button onClick={() => setCopyOk(true)}>{icon}</button>
        </div>
    )
}
