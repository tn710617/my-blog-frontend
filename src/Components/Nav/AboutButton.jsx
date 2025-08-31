import React from "react";
import {useIntl} from "react-intl";
import {usePaginationStore, useCategoryStore, usePostTagsStore} from "../../stores";
import {useNavigate} from "react-router";

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
        <button 
            onClick={handleOnClick}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-gray-100 hover:from-blue-50 hover:to-indigo-100 border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
            <div className="text-slate-600 group-hover:text-blue-600 transition-colors duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors duration-300">
                {intl.formatMessage({id: "nav.about_me_button"})}
            </span>
        </button>
    )
}