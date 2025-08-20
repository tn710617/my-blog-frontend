import React from "react";
import {BsLinkedin} from "react-icons/bs";

export default function LinkedInLinkComponent() {
    const url = import.meta.env.VITE_LINKEDIN_URL || import.meta.env.REACT_APP_LINKEDIN_URL

    if (url === undefined) {
        return null
    }

    return (
        <a href={url}><BsLinkedin className={"cursor-pointer"}/></a>
    )
}
