import React from "react";

export default function Page({page, handleClick}) {
    return (
        <button
            className="relative w-[40px] inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 justify-center"
            onClick={() => handleClick(page)}
            value={page}
        >
            {page}
        </button>
    )
}