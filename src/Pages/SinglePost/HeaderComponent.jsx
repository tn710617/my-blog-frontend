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
            const { hash } = window.location;
            const encodedId = encodeURIComponent(props.id);

            if (ref.current && hash === `#${encodedId}`) {
                // Calculate the element's position without scrolling
                const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;

                // Apply an offset (e.g., for a fixed navbar)
                const offset = 60; // Adjust this value based on your navbar's height
                const offsetPosition = elementPosition - offset;

                // Now scroll to the calculated position with offset
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        };

        // Delay the scroll operation to ensure the page and images are fully loaded
        const timeoutId = setTimeout(handleScroll, 500);

        // Clean up the timeout
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
