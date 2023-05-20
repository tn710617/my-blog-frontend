import React from "react";

export default function CurrentPage({page}) {
    return (
        <button
            aria-current="page"
            className="relative w-[40px] z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 justify-center"
            disabled={true}
        >
            {page}
        </button>
    )
}