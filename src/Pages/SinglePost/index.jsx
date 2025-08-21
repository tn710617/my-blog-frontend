import React, {useEffect} from "react";
import PostBody from "./PostBody";
import {useNavigate, useSearchParams} from "react-router";
import {useShowPost} from "../../APIs/posts";
import PostMetadata from "../../Components/PostMetadata";
import PostTags from "../../Components/PostTags";
import {useAuthStore} from "../../stores";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";

export default function SinglePost() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const [searchParams] = useSearchParams()
    const postId = searchParams.get("post_id")
    const navigate = useNavigate()

    const {isSuccess, data} = useShowPost(postId, {
        enabled: !!postId,
    })

    useEffect(() => {
        if (!postId) {
            navigate("/")
        }
    }, [postId, navigate])


    return (
        isSuccess &&
        <div className={"m-4 flex justify-between"}>
            <div className={"lg:block hidden lg:1/12 xl:w-1/6"}/>
            <div className={"flex flex-col gap-4 rounded-xl w-full 2xl:w-7/12 shadow-xl bg-gray-50 px-4 py-7"}>
                <div className={"font-semibold text-4xl"}>{data.post_title}</div>
                {
                    isLoggedIn &&
                    <div className={"flex gap-2 text-gray-400"}>
                        <EditButton postId={postId}/>
                        <span>•</span>
                        <DeleteButton postId={postId}/>
                    </div>
                }
                <PostMetadata postData={data}/>
                <PostTags tags={data.tags}/>
                <PostBody content={data.post_content}/>
            </div>
            <div className={"lg:block hidden lg:1/12 xl:w-1/6"}/>
        </div>
    )
}
