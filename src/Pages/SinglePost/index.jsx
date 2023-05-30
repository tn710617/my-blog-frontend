import React from "react";
import PostBody from "./PostBody";
import fakeMarkdownContent from "./fakeMarkdownContent";
import {useSearchParams} from "react-router-dom";
import {useShowPost} from "../../APIs/posts";
import PostMetadata from "../../Components/PostMetadata";
import PostTags from "../../Components/PostTags";

export default function SinglePost() {
    const content = fakeMarkdownContent()
    const [searchParams] = useSearchParams()
    const postId = searchParams.get("post_id")

    const {isSuccess, data} = useShowPost(postId, {
        enabled: !!postId,
    })
    const [markdownContent] = React.useState(content)

    return (
        isSuccess &&
        <div className={"m-4 flex lg:space-x-5"}>
            <div className={"lg:block hidden lg:w-1/6"}/>
            <div className={"flex flex-col gap-4 rounded-xl shadow-xl w-full m-auto bg-gray-50 px-4 py-7"}>
                <div className={"font-semibold text-4xl"}>{data.post_title}</div>
                <PostMetadata postData={data}/>
                <PostTags tags={data.tags}/>
                <PostBody content={markdownContent}/>
            </div>
            <div className={"w-1/6 justify-center lg:block my-auto hidden relative"}>
            </div>
        </div>
    )
}
