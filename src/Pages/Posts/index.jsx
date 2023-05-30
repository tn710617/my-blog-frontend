import {AiFillTags} from "react-icons/ai";
import {BsFillPenFill} from "react-icons/bs";
import Pagination from "../../Components/Pagination";
import {useRecoilState} from "recoil";
import CategoryAtom from "../../States/Category";
import {useCategories} from "../../APIs/categories";
import {useMemo, useState} from "react";
import {useIndexPosts} from "../../APIs/posts";
import PostCard from "./PostCard";
import {Link} from "react-router-dom";
import PopularTags from "./PopularTags";
import {useIndexPopularTags} from "../../APIs/tags";
import PostsInfo from "./PostsInfo";

export default function Posts() {
    const [categoryId] = useRecoilState(CategoryAtom)
    const [currentPage, setCurrentPage] = useState(1)
    const [sort, setSort] = useState("created_at")
    const [tags, setTags] = useState([])
    const indexCategory = useCategories()
    const indexPosts = useIndexPosts({}, currentPage, categoryId, tags, sort)
    const indexPopularTags = useIndexPopularTags()
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


    return (
        <div
            className={"flex mx-3 flex-col items-center lg:flex-row lg:items-start lg:justify-center mt-8 gap-6 mb-12"}>
            <div className={"w-full md:w-[700px]"}>
                <div className={"flex flex-col-reverse gap-4 md:flex-row md:gap-0 justify-between"}>
                    <PostsInfo setSort={setSort} sort={sort}/>
                    {
                        indexCategory.isSuccess &&
                        <div
                            className={"flex flex-row gap-1 justify-end items-center border border-0 border-black border-b-2 pl-8 mb-1"}>
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
                        className={"md:w-[700px] lg:w-[300px] border border-2 rounded-xl border-green-500 p-4 bg-white shadow-lg"}>
                        <h1 className={"text-center font-semibold text-lg pb-2 border border-black border-0 border-b-2 capitalize"}>
                            learan or die
                        </h1>
                        <p className={"mt-4"}>
                            The value of life lies not in the length of days, but in the use we make of them
                            <br/>
                            人生的價值不在長短，在於每個沒有遺憾的當下。
                        </p>
                        <button
                            className={"flex cursor-pointer border bg-emerald-500 w-full py-2 px-2 rounded-lg mt-6 items-center justify-center gap-2 text-gray-100 hover:bg-blue-500 transition-colors duration-500 relative"}>
                            <BsFillPenFill/>
                            <Link to={"create-post"}
                                  className={"font-semibold text-lg after:absolute after:inset-0"}>寫一篇</Link>
                        </button>
                    </div>
                    <div className={"md:w-[700px] lg:w-[300px] rounded-xl p-4 bg-white mt-5 shadow-lg"}>
                        <div
                            className={"flex justify-center border border-black border-0 border-b-2 pb-2 items-center gap-1"}>
                            <AiFillTags className={"text-xl"}/>
                            <h1 className={"font-semibold text-lg capitalize"}>
                                熱門標籤
                            </h1>
                        </div>
                        <div className={"mt-4"}>
                            {
                                indexPopularTags.isSuccess &&
                                <PopularTags tags={tags} setTags={setTags}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
