import React, {useEffect, useLayoutEffect} from "react";
import PostBody from "./PostBody";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useShowPost} from "../../APIs/posts";
import PostMetadata from "../../Components/PostMetadata";
import PostTags from "../../Components/PostTags";
import {useRecoilState} from "recoil";
import localeAtom from "../../States/localeAtom";
import EditButton from "./EditButton";
import isLoggedInAtom from "../../States/LoginAtom";
import DeleteButton from "./DeleteButton";

export default function SinglePost() {
    const [isLoggedIn] = useRecoilState(isLoggedInAtom)
    const [locale] = useRecoilState(localeAtom)
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

    useLayoutEffect(() => {
        if (isSuccess && locale !== data.locale) {
            navigate("/")
        }
    }, [data, locale, isSuccess, navigate])

    return (
        isSuccess &&
        <div className={"m-4 flex lg:space-x-5"}>
            <div className={"lg:block hidden w-full"}/>
            <div className={"flex flex-col gap-4 rounded-xl shadow-xl w-full lg:w-[900px] xl:w-[1028px] m-auto bg-gray-50 px-4 py-7"}>
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
            <div className={"w-full justify-center lg:block my-auto hidden relative"}>
            </div>
        </div>
    )
}
