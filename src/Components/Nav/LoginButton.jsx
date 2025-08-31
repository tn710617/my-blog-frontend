import React from "react";
import {useIntl} from "react-intl";

export default function LoginButton({onClick, isLoading}) {
    const intl = useIntl()
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 border border-green-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
            <div className="text-green-600 group-hover:text-green-700 transition-colors duration-300">
                {isLoading ? (
                    <div className="animate-spin w-[18px] h-[18px] border-2 border-green-600 border-t-transparent rounded-full"></div>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10,17 15,12 10,7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                )}
            </div>
            <span className="text-sm font-medium text-green-700 group-hover:text-green-800 transition-colors duration-300">
                {intl.formatMessage({id: "nav.login_button"})}
            </span>
        </button>
    )
}