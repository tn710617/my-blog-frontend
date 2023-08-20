import {AiFillTags} from "react-icons/ai";
import {BsFillPenFill} from "react-icons/bs";

import Pagination from "../../Components/Pagination";
import PostCard from "./PostCard";
import PopularTags from "./PopularTags";
import PostsInfo from "./PostsInfo";

import {useRecoilState} from "recoil";
import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {useIntl} from "react-intl";

import {useCategories} from "../../APIs/categories";
import {useIndexPosts} from "../../APIs/posts";
import {useQueryClient} from "@tanstack/react-query";

import CategoryAtom from "../../States/category";
import loginAtom from "../../States/loginAtom";
import postSortAtom from "../../States/postSortAtom";

export default function Posts() {
    const intl = useIntl()
    const [categoryId] = useRecoilState(CategoryAtom)
    const [isLogIn] = useRecoilState(loginAtom)
    const [currentPage, setCurrentPage] = useState(1)
    const [sort, setSort] = useRecoilState(postSortAtom)
    const [tags, setTags] = useState([])
    const indexCategory = useCategories()
    const indexPosts = useIndexPosts({}, currentPage, categoryId, tags, sort)
    const queryClient = useQueryClient()
    const currentCategory = useMemo(() => {
        if (indexCategory.status === 'success') {
            return indexCategory.data.find(({id}) => parseInt(id) === parseInt(categoryId))
        }
    }, [indexCategory.status, indexCategory.data, categoryId])

    const indexPostsMeta = useMemo(() => {
        if (indexPosts.status === 'success') {
            return indexPosts.data.meta
        }
    }, [indexPosts.status, indexPosts.data])

    useEffect(() => {
        queryClient.invalidateQueries(indexPosts.queryKey)
    }, [isLogIn])

    return (
        <div
            className={"flex mx-3 flex-col items-center lg:flex-row lg:items-start lg:justify-center mt-8 gap-6 mb-12"}>
            <div className={"w-full md:w-[700px]"}>
                <div className={"flex flex-col-reverse gap-4 md:flex-row md:gap-0 justify-between"}>
                    <PostsInfo setSort={setSort} sort={sort}/>
                    {
                        indexCategory.isSuccess &&
                        <div
                            className={"flex flex-row gap-1 justify-end items-center border-0 border-black border-b-2 pl-8 mb-1"}>
                            <div className={"font-bold capitalize"}>
                                {currentCategory.category_name}:
                            </div>
                            <div
                                className={"text-sm"}>{currentCategory.category_description}</div>
                        </div>
                    }
                </div>
                <div>
                    {
                        indexPosts.isSuccess &&
                        indexPosts.data.data.map(post => {
                            return <PostCard post={post} key={post.id}/>
                        })
                    }

                </div>
                <div className={"mt-4"}>
                    {
                        indexPosts.isSuccess &&
                        <Pagination currentPage={currentPage} totalPages={indexPostsMeta.last_page}
                                    postsPerPage={indexPostsMeta.per_page} totalPosts={indexPostsMeta.total}
                                    setCurrentPage={setCurrentPage}/>
                    }
                </div>
            </div>
            <div className={"relative md:w-[700px]] lg:w-[300px]"}>
                <div className={"lg:fixed lg:top-30"}>
                    <div
                        className={"md:w-[700px] lg:w-[300px] border-2 rounded-xl border-green-500 p-4 bg-white shadow-lg"}>
                        <h1 className={"text-center font-semibold text-lg pb-2 border-black border-0 border-b-2 capitalize"}>
                            learan or die
                        </h1>
                        <p className={"mt-4"}>
                            {intl.formatMessage({id: "index_posts.motto"})}
                        </p>
                        {
                            isLogIn &&
                            <button
                                className={"flex cursor-pointer border bg-emerald-500 w-full py-2 px-2 rounded-lg mt-6 items-center justify-center gap-2 text-gray-100 hover:bg-blue-500 transition-colors duration-500 relative"}>
                                <BsFillPenFill/>
                                <Link to={"create-post"}
                                      className={"font-semibold text-lg after:absolute after:inset-0"}>{intl.formatMessage({id: "index_posts.store_post_button"})}</Link>
                            </button>
                        }
                    </div>
                    <div
                        className={"md:w-[700px] lg:w-[300px] rounded-xl p-4 bg-white mt-5 shadow-lg lg:max-h-[585px] lg:overflow-y-auto lg:no-scrollbar"}>
                        <div
                            className={"flex justify-center border-black border-0 border-b-2 pb-2 items-center gap-1"}>
                            <AiFillTags className={"text-xl"}/>
                            <h1 className={"font-semibold text-lg capitalize"}>
                                {intl.formatMessage({id: "index_posts.popular_tags"})}
                            </h1>
                        </div>
                        <div className={"mt-4"}>
                            <PopularTags tags={tags} setTags={setTags} setCurrentPage={setCurrentPage}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
