import React from "react";
import {MdSearchOff} from "react-icons/md";

export default function NoSearchResult({searchTerm}) {
    return (
        <div className={"flex flex-col justify-center items-center"}>
            <div>
                <MdSearchOff className={"text-2xl"}/>
            </div>
            <div className={"text-sm"}>
                No search result for <span className={"text-black"}>"{searchTerm}"</span>
            </div>
        </div>
    )
}