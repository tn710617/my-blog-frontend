import React from "react";
import CategoryIcon from "./CategoryIcon";
import {MdFiberNew} from "react-icons/md";
import {GrUpdate} from "react-icons/gr";
import {FormattedDate} from "react-intl";
import {useNavigate} from "react-router-dom";
import {useRecoilState} from "recoil";
import categoryAtom from "../States/Category";
import postSortAtom from "../States/postSortAtom";
import {RiGitRepositoryPrivateLine} from "react-icons/ri";

export default function PostMetadata({postData}) {
    const navigate = useNavigate()
    const [, setCurrentCategory] = useRecoilState(categoryAtom)
    const [, setPostSort] = useRecoilState(postSortAtom)
    const handleCategoryClick = () => {
        setCurrentCategory(postData.category_id)
        navigate('/')
    }

    const handleCreatedAtOnClick = () => {
        setPostSort("created_at")
        navigate('/')
    }

    const handleUpdatedAtOnClick = () => {
        setPostSort("updated_at")
        navigate('/')
    }

    return (
        <div className={"flex flex-wrap items-center text-gray-400 gap-3"}>
            <button className={"flex hover:text-gray-500 items-center"}
                    onClick={handleCategoryClick}
            >
                <CategoryIcon category_id={postData.category_id}/>
                <span className={"ml-2 capitalize"}>{postData.category.category_name}</span>
            </button>
            <span>•</span>
            <button className={"flex gap-2 hover:text-gray-500 items-center"}
                    onClick={handleCreatedAtOnClick}
            >
                <MdFiberNew className={"text-xl text-black"}/>
                <FormattedDate value={postData.created_at} year={"numeric"} month={"long"} day={"numeric"}/>
            </button>
            <span>•</span>
            <button className={"flex gap-2 hover:text-gray-500 items-center"}
                    onClick={handleUpdatedAtOnClick}
            >
                <GrUpdate/>
                <FormattedDate value={postData.updated_at} year={"numeric"} month={"long"} day={"numeric"}/>
            </button>
            {
                !postData.is_public &&
                <>
                    <span>•</span>
                    <RiGitRepositoryPrivateLine className={"text-xl"}/>
                </>
            }

        </div>

    )
}
