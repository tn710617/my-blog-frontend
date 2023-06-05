import React from "react";
import {FaCopy} from "react-icons/fa";
import {FaCheckSquare} from "react-icons/fa";

export default function CodeCopyBtn({children}) {
    const [copyOk, setCopyOk] = React.useState(false);

    const icon = copyOk ? <FaCheckSquare className={"text-white"}/> : <FaCopy/>;

    const handleClick = (e) => {
        navigator.clipboard.writeText(children[0].props.children[0]);

        setCopyOk(true);

        setTimeout(() => {
            setCopyOk(false);
        }, 500);
    }

    return (
        <div
            className="text-white absolute right-2 top-3 text-2xl cursor-pointer transition-all duration-300 ease-in-out hover:transform hover:scale-110 hover:opacity-90">
            <button onClick={handleClick}>{icon}</button>
        </div>
    )
}
