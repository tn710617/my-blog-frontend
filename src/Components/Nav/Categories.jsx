import React from "react";
import CategoryIcon from "../CategoryIcon";
import {useCategoryStore} from "../../stores";
import {useNavigate} from "react-router";

export default function Categories({categories}) {
    const navigate = useNavigate()
    const categoryId = useCategoryStore((state) => state.categoryId)
    const setCategoryId = useCategoryStore((state) => state.setCategoryId)
    const handleCategoryOnClick = (e) => {
        navigate('/')
        setCategoryId(e.target.value)
    }

    const getIsCurrentCategory = (id) => {
        return parseInt(categoryId) === parseInt(id)
    }

    const getFinalClass = (id) => {
        const isCurrentCategory = getIsCurrentCategory(id)
        const defaultClass = "flex items-center relative gap-2 group"
        return isCurrentCategory ? defaultClass + " text-blue-400" : defaultClass + " hover:text-blue-400"
    }

    const SingleCategory = ({id, category_name}) => {
        const finalClass = getFinalClass(id)
        const isCurrentCategory = getIsCurrentCategory(id)
        return (
            <div key={id} className={finalClass}
            >
                <CategoryIcon category_id={id}/>
                <button className={"capitalize after:absolute after:inset-0"} value={id}
                        onClick={handleCategoryOnClick}>{category_name}</button>
                {
                    isCurrentCategory ?
                        <span
                            className={"absolute w-full h-1 rounded-full transition-all bg-blue-400 duration-300 top-11 opacity-100"}></span>
                        :
                        <span
                            className={"absolute w-full h-1 rounded-full transition-all bg-blue-400 duration-300 top-12 opacity-0 group-hover:top-11 group-hover:opacity-100"}></span>

                }
            </div>
        )

    }

    return (
        <div className={"hidden lg:flex gap-4 text-lg text-gray-400"}>
            {
                categories.map(({id, category_name}) => {
                    return (
                        <SingleCategory key={id} id={id} category_name={category_name}/>
                    )
                })
            }
        </div>
    )
}