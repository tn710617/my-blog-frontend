import React from "react";
import lodash from "lodash";
import PostTags from "../../Components/PostTags";
import PostMetadata from "../../Components/PostMetadata";
import {useNavigate} from "react-router-dom";
import removeMd from "remove-markdown";

export default function PostCard({post}) {
    const navigate = useNavigate()
    const {id, post_title, post_content, tags} = post
    const handlePostCardClick = (e) => {
        const postId = e.target.id
        navigate(`/single-post?post_id=${postId}`)
    }

    return (
        <div className={"mt-6 p-6 flex flex-col gap-2 rounded-xl bg-white shadow-xl relative"}>
            <div className={"cursor-pointer group"}>
                <div
                    className={"font-bold text-xl mb-2 border border-0 border-b-2 border-b-transparent group-hover:border-blue-400"}>{post_title}
                </div>
                <p className={"text-gray-400 group-hover:text-gray-500"}>{lodash.truncate(removeMd(post_content), {
                    length: 200,
                    omission: "..."
                })}</p>
                <div className={"after:absolute after:inset-0"} id={id} onClick={handlePostCardClick}></div>
            </div>
            <PostTags tags={tags}/>
            <PostMetadata postData={post}/>
        </div>
    )
}