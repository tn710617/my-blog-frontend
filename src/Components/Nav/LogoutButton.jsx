import React from "react";
import {useIntl} from "react-intl";

export default function LogoutButton({onClick, isLoading}) {
    const intl = useIntl()
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-50 to-rose-100 hover:from-red-100 hover:to-rose-200 border border-red-200 hover:border-red-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
            <div className="text-red-600 group-hover:text-red-700 transition-colors duration-300">
                {isLoading ? (
                    <div className="animate-spin w-[18px] h-[18px] border-2 border-red-600 border-t-transparent rounded-full"></div>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                )}
            </div>
            <span className="text-sm font-medium text-red-700 group-hover:text-red-800 transition-colors duration-300">
                {intl.formatMessage({id: "nav.logout_button"})}
            </span>
        </button>
    )
}