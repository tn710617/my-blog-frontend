import {useTags} from "../../APIs/tags";
import React, {useEffect, useMemo} from "react";
import {useRecoilState} from "recoil";
import postTagsAtom from "../../States/postTags";
import currentPageAtom from "../../States/currentPageAtom";
import categoryAtom from "../../States/category";
import {useNavigate} from "react-router-dom";
import loginAtom from "../../States/loginAtom";
import {useQueryClient} from "@tanstack/react-query";


const DISPLAY_POPULAR_TAGS = 20

export default function Skills() {
    const indexTags = useTags()
    const [showMoreTags, setShowMoreTags] = React.useState(false)
    const [, setTags] = useRecoilState(postTagsAtom)
    const [, setCurrentPage] = useRecoilState(currentPageAtom)
    const [, setCategory] = useRecoilState(categoryAtom)
    const [isLoggedIn] = useRecoilState(loginAtom)
    const queryClient = useQueryClient()

    const navigate = useNavigate()

    const popularTags = useMemo(() => {
        if (indexTags.status === 'success')
            return indexTags.data.slice(0, DISPLAY_POPULAR_TAGS)
    }, [indexTags.status, indexTags.data])

    const displayedTags = useMemo(() => {
        if (indexTags.status === 'success') {
            if (showMoreTags)
                return indexTags.data
            else
                return popularTags
        }
    }, [showMoreTags, indexTags.status, indexTags.data, popularTags])

    useEffect(() => {
        queryClient.invalidateQueries(indexTags.queryKey)
    }, [isLoggedIn]);

    const handleTagClick = (e) => {
        const id = e.target.value
        setCurrentPage(1)
        setCategory(2)
        setTags(() => [id])
        navigate(`/`)
    }

    return (
        indexTags.isSuccess &&
        <div className={"rounded-xl border p-4 bg-white shadow-lg"}>
            <div className={"flex flex-wrap gap-2"}>
                {
                    indexTags.isSuccess &&
                    displayedTags.map(({id, tag_name}) => {
                        return (
                            <button key={id}
                                    className={"py-1 px-3 border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 transition-colors duration-300 cursor-pointer hover:bg-slate-400"}
                                    value={id} onClick={handleTagClick}
                            >
                                {tag_name}
                            </button>
                        )
                    })
                }
                <button className={"text-gray-400 hover:text-gray-800"} onClick={() => setShowMoreTags(pre => !pre)}>
                    {showMoreTags ? 'show less tags ...' : 'show more tags ...'}
                </button>
            </div>
        </div>
    )
}