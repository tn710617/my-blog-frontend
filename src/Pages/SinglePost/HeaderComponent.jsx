import React from "react";
import {useRef, useEffect} from "react";

export default function HeaderComponent(props) {
    const {tagName} = props.node;
    const ref = useRef();

    const handleHeaderClicked = (e) => {
        window.location.hash = `#${e.target.id}`
    };

    useEffect(() => {
        const {hash} = window.location;
        if (hash === encodeURI(`#${props.children}`)) {
            ref.current.scrollIntoView({block: "center"});
        }
    }, [props.children]);

    let HeaderTag = "h4"; // Default to h4

    switch (tagName) {
        case "h1":
            HeaderTag = "h1";
            break;
        case "h2":
            HeaderTag = "h2";
            break;
        case "h3":
            HeaderTag = "h3";
            break;
        case "h4":
            HeaderTag = "h4";
            break;
        case "h5":
            HeaderTag = "h5";
            break;
        case "h6":
            HeaderTag = "h6";
            break;
        default:
            break;
    }

    return (
        <HeaderTag
            id={props.children}
            ref={ref}
            onClick={handleHeaderClicked}
            className="font-bold cursor-pointer"
            style={{cursor: "pointer"}}
        >
            {props.children}
        </HeaderTag>
    );
}
