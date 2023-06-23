import React from "react";
import CategoryIcon from "../CategoryIcon";
import {useNavigate} from "react-router-dom";
import removeMd from "remove-markdown";

export default function SearchResult({searchedPosts, setShowSearchBoxComponent}) {
    const navigate = useNavigate()
    const handleSearchedPostClick = (event) => {
        const postId = event.target.id
        navigate(`/single-post?post_id=${postId}`)
        setShowSearchBoxComponent(false)
    }
    return (
        <div className={"flex flex-col gap-2"}>
            {
                searchedPosts &&
                searchedPosts.map(({id, category_id, post_title, post_content}) => {
                    return (
                        <div
                            key={id}
                            className={"hover:bg-gray-100 px-1 group rounded m-0 cursor-pointer relative"}
                        >
                            <div
                                className={"text-lg text-gray-900 group-hover:text-emerald-500 flex items-center gap-1"}>
                                <div className={"text-gray-800 text-sm"}>
                                    <CategoryIcon category_id={category_id}/>
                                </div>
                                <div className={"truncate"}>
                                    {post_title}
                                </div>
                            </div>
                            <div className={"text-sm text-gray-400 truncate"}>
                                {removeMd(post_content)}
                            </div>
                            <div id={id} onClick={handleSearchedPostClick}
                                 className={"after:absolute after:inset-0"}></div>
                        </div>
                    )
                })
            }
        </div>
    )
}