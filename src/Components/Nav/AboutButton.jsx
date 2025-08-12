import React from "react";
import {useIntl} from "react-intl";
import {usePaginationStore, useCategoryStore, usePostTagsStore} from "../../stores";
import {useNavigate} from "react-router-dom";

export default function AboutButton({onClick, isLoading}) {
    const intl = useIntl()
    const setCurrentPage = usePaginationStore((state) => state.setCurrentPage)
    const setCategoryId = useCategoryStore((state) => state.setCategoryId)
    const setTags = usePostTagsStore((state) => state.setTags)
    const navigate = useNavigate()
    const handleOnClick = () => {
        setCategoryId(null)
        setTags([])
        setCurrentPage(null)
        navigate("/about")
    }
    return (
        <button onClick={handleOnClick}>
            <span className={"text-sm sm:text-xl"}>{intl.formatMessage({id: "nav.about_me_button"})}</span>
        </button>
    )
}