import React from "react";
import {BsGithub} from "react-icons/bs";

export default function GitHubLinkComponent() {
    const url = process.env.REACT_APP_GITHUB_URL

    if (url === undefined) {
        return null
    }

    return (
        <a href={url}><BsGithub className={"cursor-pointer"}/></a>
    )
}