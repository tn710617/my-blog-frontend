import React from "react";
import {useIntl} from "react-intl";
import currentPageAtom from "../../States/currentPageAtom";
import categoryAtom from "../../States/category";
import postTagsAtom from "../../States/postTags";
import {useRecoilState} from "recoil";
import {useNavigate} from "react-router-dom";

export default function AboutButton({onClick, isLoading}) {
    const intl = useIntl()
    const [, setCurrentPage] = useRecoilState(currentPageAtom)
    const [, setCategory] = useRecoilState(categoryAtom)
    const [, setPostTags] = useRecoilState(postTagsAtom)
    const navigate = useNavigate()
    const handleOnClick = () => {
        setCategory(null)
        setPostTags([])
        setCurrentPage(null)
        navigate("/about")
    }
    return (
        <button onClick={handleOnClick}>
            <span className={"text-sm sm:text-xl"}>{intl.formatMessage({id: "nav.about_me_button"})}</span>
        </button>
    )
}