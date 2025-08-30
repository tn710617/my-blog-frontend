import React from "react";
import {usePaginationStore, useCategoryStore, usePostTagsStore} from "../../stores";
import {useNavigate} from "react-router";

export default function TravelPinsButton() {
    const setCurrentPage = usePaginationStore((state) => state.setCurrentPage)
    const setCategoryId = useCategoryStore((state) => state.setCategoryId)
    const setTags = usePostTagsStore((state) => state.setTags)
    const navigate = useNavigate()
    
    const handleOnClick = () => {
        setCategoryId(null)
        setTags([])
        setCurrentPage(null)
        navigate("/travel-pins")
    }
    
    return (
        <button onClick={handleOnClick}>
            <span className={"text-sm sm:text-xl"}>Travel Pins</span>
        </button>
    )
}