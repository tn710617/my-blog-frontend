import React from "react";
import {useRef, useEffect} from "react";

export default function HeaderComponent(props) {
    const {tagName} = props.node;
    const ref = useRef(null);

    const handleHeaderClicked = (e) => {
        window.location.hash = `${e.target.id}`
    };

    useEffect(() => {
        const handleScroll = () => {
            const {hash} = window.location;
            const encodedId = encodeURIComponent(props.id);

            if (ref.current && hash === `#${encodedId}`) {
                ref.current.scrollIntoView({block: "start"});

                const offset = 60; // 你可以根據 nav bar 的高度調整這個值
                const elementPosition = window.scrollY - offset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: "smooth"
                });
            }
        };

        // 使用 setTimeout 延遲滾動操作，確保圖片加載完成
        const timeoutId = setTimeout(handleScroll, 500);

        // 清理 timeout
        return () => clearTimeout(timeoutId);
    }, [props.id, window.location.hash]);


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
            id={props.id}
            ref={ref}
            onClick={handleHeaderClicked}
            className="font-bold cursor-pointer"
            style={{cursor: "pointer"}}
        >
            {props.children}
        </HeaderTag>
    );
}
