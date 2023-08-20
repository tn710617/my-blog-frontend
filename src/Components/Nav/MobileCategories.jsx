import React from "react";
import CategoryIcon from "../CategoryIcon";
import {useRecoilState} from "recoil";
import categoryAtom from "../../States/category";
import {useNavigate} from "react-router-dom";

export default function MobileCategories({categories}) {
    const navigate = useNavigate()
    const [category, setCategory] = useRecoilState(categoryAtom)
    const handleCategoryOnClick = (e) => {
        navigate('/')
        setCategory(e.target.value)
    }

    const getIsCurrentCategory = (id) => {
        return parseInt(category) === parseInt(id)
    }

    const getFinalClass = (id) => {
        const defaultClass = "flex rounded-lg px-2 items-center hover:cursor-pointer relative gap-2"
        const variableClass = getIsCurrentCategory(id) ? "bg-gray-200 text-black" : "hover:bg-gray-200 hover:text-black"

        return defaultClass + " " + variableClass
    }

    const SingleCategory = ({id, category_name}) => {
        return (
            <div
                className={getFinalClass(id)}>
                <CategoryIcon category_id={id}/>
                <button className={"after:absolute after:inset-0"} value={id}
                        onClick={handleCategoryOnClick}>{category_name}</button>
            </div>
        )
    }
    return (
        categories.map(({id, category_name}) => {
            return (
                <SingleCategory id={id} category_name={category_name} key={id}/>
            )
        })
    )

}