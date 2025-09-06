import React from "react";
import {usePaginationStore, useCategoryStore, usePostTagsStore} from "../../stores";
import {useNavigate} from "react-router";

export default function TravelPinsButton() {
    const navigate = useNavigate()
    
    const handleOnClick = () => {
        navigate("/travel-pins-new")
    }
    
    return (
        <button 
            onClick={handleOnClick}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-100 hover:from-emerald-100 hover:to-teal-200 border border-emerald-200 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
            <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
            </div>
            <span className="text-sm font-medium text-emerald-700 group-hover:text-emerald-800 transition-colors duration-300">
                Travel Pins
            </span>
        </button>
    )
}