import React from "react";
import {AiFillTags} from "react-icons/ai";

export default function PostTags({tags}) {
    return (
        <div className={"flex flex-wrap items-center gap-2"}>
            <AiFillTags className={"text-xl text-gray-400 cursor-pointer"}/>
            {
                tags.map(({id, tag_name}) => {
                    return (
                        <div key={id}
                             className={"py-1 px-3 border border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 transition-colors duration-300 cursor-pointer"}>
                            {tag_name}
                        </div>
                    )
                })

            }
        </div>

    )
}