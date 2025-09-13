import React from "react";
import CategoryIcon from "../CategoryIcon";
import {useNavigate} from "react-router";
import removeMd from "remove-markdown";

export default function SearchResult({searchedPosts, setShowSearchBoxComponent, selectedResultIndex}) {
    const navigate = useNavigate()
    const handleSearchedPostClick = (event) => {
        const postId = event.target.id
        navigate(`/single-post?post_id=${postId}`)
        setShowSearchBoxComponent(false)
    }
    let resultIndex = 0
    
    return (
        <div className={"flex flex-col gap-2"}>
            {
                searchedPosts.isSuccess &&
                searchedPosts.data.pages.map((page, pageIndex) => (
                    page.data.map(({id, category_id, post_title, post_content}) => {
                            const currentIndex = resultIndex++
                            const isSelected = currentIndex === selectedResultIndex
                            
                            return (
                                <div
                                    key={id}
                                    className={`px-1 group rounded m-0 cursor-pointer relative ${
                                        isSelected ? 'bg-gray-100' : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div
                                        className={`text-lg flex items-center gap-1 ${
                                            isSelected 
                                                ? 'text-emerald-500' 
                                                : 'text-gray-900 group-hover:text-emerald-500'
                                        }`}>
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
                        }
                    )))
            }
        </div>
    )
}