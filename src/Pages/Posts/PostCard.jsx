import React from "react";
import lodash from "lodash";
import PostTags from "../../Components/PostTags";
import PostMetadata from "../../Components/PostMetadata";

export default function PostCard({post}) {
    return (
        <div className={"mt-6 p-6 flex flex-col gap-2 rounded-xl bg-white shadow-xl"}>
            <div className={"cursor-pointer group"}>
                <div
                    className={"font-bold text-xl mb-2 border border-0 border-b-2 border-b-transparent group-hover:border-blue-400"}>{post.post_title}
                </div>
                <p className={"text-gray-400 group-hover:text-gray-500"}>{lodash.truncate(post.post_content, {
                    length: 200,
                    omission: "..."
                })}</p>

            </div>
            <PostTags tags={post.tags}/>
            <PostMetadata postData={post}/>
        </div>
    )
}