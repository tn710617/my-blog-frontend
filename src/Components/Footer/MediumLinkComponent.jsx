import React from "react";
import {BsMedium} from "react-icons/bs";

export default function MediumLinkComponent() {
    const url = import.meta.env.VITE_MEDIUM_URL || import.meta.env.REACT_APP_MEDIUM_URL

    if (url === undefined) {
        return null
    }

    return (
        <a href={url}><BsMedium className={"cursor-pointer"}/></a>
    )
}
