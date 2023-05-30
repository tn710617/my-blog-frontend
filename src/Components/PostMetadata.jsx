import React from "react";
import CategoryIcon from "./CategoryIcon";
import {MdFiberNew} from "react-icons/md";
import {GrUpdate} from "react-icons/gr";
import dayjs from "dayjs";

export default function PostMetadata({postData}) {
    return (
        <div className={"flex flex-wrap items-center text-gray-400 gap-3"}>
            <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                <CategoryIcon category_id={postData.category_id}/>
                <span className={"ml-2"}>{postData.category.category_name}</span>
            </div>
            <span>•</span>
            <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                <MdFiberNew className={"text-xl text-black"}/>
                <span className={"ml-2"}>{dayjs(postData.created_at).format('YYYY/MM/DD HH:mm')}</span>
            </div>
            <span>•</span>
            <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                <GrUpdate/>
                <span className={"ml-2"}>{dayjs(postData.updated_at).format('YYYY/MM/DD HH:mm')}</span>
            </div>
        </div>

    )
}
