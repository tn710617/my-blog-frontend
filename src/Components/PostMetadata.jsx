import React from "react";
import CategoryIcon from "./CategoryIcon";
import {MdFiberNew} from "react-icons/md";
import {GrUpdate} from "react-icons/gr";
import {FormattedDate} from "react-intl";

export default function PostMetadata({postData}) {
    return (
        <div className={"flex flex-wrap items-center text-gray-400 gap-3"}>
            <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                <CategoryIcon category_id={postData.category_id}/>
                <span className={"ml-2 capitalize"}>{postData.category.category_name}</span>
            </div>
            <span>•</span>
            <div className={"flex gap-2 cursor-pointer hover:text-gray-500 items-center"}>
                <MdFiberNew className={"text-xl text-black"}/>
                <FormattedDate value={postData.created_at} year={"numeric"} month={"long"} day={"numeric"}/>
            </div>
            <span>•</span>
            <div className={"flex gap-2 cursor-pointer hover:text-gray-500 items-center"}>
                <GrUpdate/>
                <FormattedDate value={postData.updated_at} year={"numeric"} month={"long"} day={"numeric"}/>
            </div>
        </div>

    )
}
