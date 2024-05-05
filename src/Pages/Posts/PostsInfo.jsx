import React from "react";
import {MdArticle, MdUpdate} from "react-icons/md";
import {useIntl} from "react-intl";

export default function PostsInfo({setSort, sort}) {
    const intl = useIntl()
    const isCurrentSort = (value) => {
        return sort === value
    }
    return (
        <div className={"flex flex-row justify-items-start items-center bg-gray-300 rounded-xl px-1 py-1"}>
            <button
                className={"flex items-center m-0 gap-1 py-2 rounded-xl pl-4 pr-4 cursor-pointer " + (isCurrentSort("created_at") ? "bg-white" : "hover:bg-white")}
                value={"created_at"}
                onClick={(e) => setSort(e.target.value)}
            >
                <MdArticle/>
                {intl.formatMessage({id: "posts_info.latest_posts_title"})}
            </button>
            <button
                className={"flex items-center m-0 gap-1 px-4 rounded-xl py-2 cursor-pointer " + (isCurrentSort("updated_at") ? "bg-white" : "hover:bg-white")}
                value={"updated_at"}
                onClick={(e) => setSort(e.target.value)}
            >
                <MdUpdate/>
                {intl.formatMessage({id: "posts_info.recently_updated_posts_title"})}
            </button>
            {/*<div*/}
            {/*    className={"flex items-center m-0 gap-1 py-2 px-4 rounded-xl cursor-pointer hover:bg-white"}>*/}
            {/*    /!*<TfiCommentsSmiley/>*!/*/}
            {/*    最多留言*/}
            {/*</div>*/}
        </div>
    )
}