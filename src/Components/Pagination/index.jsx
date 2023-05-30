import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import React from "react";
import {range} from 'lodash'
import CurrentPage from "./CurrentPage";
import Page from "./Page";

export default function Pagination({currentPage, setCurrentPage, totalPosts, totalPages}) {
    const DISPLAY_PAGES = 10
    const displayPages = React.useMemo(() => {
        return totalPages > DISPLAY_PAGES ? DISPLAY_PAGES : totalPages
    }, [DISPLAY_PAGES, totalPages])

    const [startPage, setStartPage] = React.useState(1)

    React.useLayoutEffect(() => {
        if (currentPage >= startPage + 6 && startPage + DISPLAY_PAGES - 1 < totalPages) {
            setStartPage(() => {
                return currentPage - 5 + DISPLAY_PAGES - 1 > totalPages ? totalPages - DISPLAY_PAGES + 1 : currentPage - 5
            })
        } else if (currentPage <= startPage + 4 && startPage > 1) {
            setStartPage(() => {
                return currentPage - 5 > 0 ? currentPage - 5 : 1
            })
        }
    }, [currentPage, DISPLAY_PAGES, totalPages, startPage])

    const handleNextPageClick = () => {
        if (currentPage === totalPages) return
        setCurrentPage(currentPage + 1)
    }

    const handlePreviousPageClick = () => {
        if (currentPage === 1) return
        setCurrentPage(currentPage - 1)
    }

    const handlePageClick = (page) => {
        setCurrentPage(page)
    }

    return (
        <div
            className="flex items-center justify-between rounded-xl border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={currentPage === 1}
                    onClick={handlePreviousPageClick}
                >
                    Previous
                </button>
                <button
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                    onClick={handleNextPageClick}
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        顯示 <span className="font-medium">1</span> to <span
                        className="font-medium">{totalPages}</span> of{' '}
                        <span className="font-medium">{totalPosts}</span> 結果
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            onClick={() => handlePreviousPageClick()}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Previous</span>
                            <FaChevronLeft className="h-5 w-5" aria-hidden="true"/>
                        </button>
                        {
                            range(startPage, startPage + displayPages).map((page) => {
                                if (page === currentPage) {
                                    return <CurrentPage key={page} page={page}/>
                                }
                                return <Page key={page} page={page} handleClick={handlePageClick}/>
                            })
                        }
                        <button
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            onClick={() => handleNextPageClick()}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Next</span>
                            <FaChevronRight className="h-5 w-5" aria-hidden="true"/>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    )
}
