import React, {useEffect} from "react";
import {BsSearch} from "react-icons/bs";
import SearchResultDropdown from "./SearchResultDropdown";
import {useDebounce} from "../../hooks/useDebounce";
import {useInfinitePosts, useSemanticSearchPosts} from "../../APIs/posts";
import {useIntl} from "react-intl";
import {useNavigate} from "react-router";
import {useAuthStore} from "../../stores";

export default function SearchBoxInput({
                                           showSearchResultDropdown,
                                           setShowSearchResultDropdown,
                                           setShowSearchBoxComponent
                                       }) {
    const searchBoxInputIdPrefix = React.useId()
    const intl = useIntl()
    const navigate = useNavigate()
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

    const [searchTerm, setSearchTerm] = React.useState("")
    const [searchMode, setSearchMode] = React.useState("fulltext")
    const [submittedQuery, setSubmittedQuery] = React.useState("")
    const [selectedResultIndex, setSelectedResultIndex] = React.useState(-1)
    const searchBoxInputRef = React.useRef()

    // Semantic search is admin-only; without a login the toggle is hidden and we stay on fulltext.
    const isSemantic = isLoggedIn && searchMode === "semantic"

    const debouncedSearchTerm = useDebounce(searchTerm, 1000)
    const infinitePosts = useInfinitePosts({enabled: ! isSemantic && debouncedSearchTerm.length !== 0}, null, [], null, debouncedSearchTerm)
    // Semantic queries hit OpenAI per request, so they fire on submit (Enter) only, never per keystroke.
    const semanticPosts = useSemanticSearchPosts(submittedQuery, {enabled: isSemantic && submittedQuery !== ""})

    const activeResult = isSemantic ? semanticPosts : infinitePosts
    const activeTerm = isSemantic ? submittedQuery : debouncedSearchTerm

    // click event would bubble up to the parent element, so we need to stop it, otherwise the input would be closed immediately
    const handleSearchBoxComponentInternallyClicked = (event) => {
        event.stopPropagation()
    }

    const handleSearchBoxInputChanged = (event) => {
        const value = event.target.value
        setSearchTerm(value)
        setSelectedResultIndex(-1) // Reset selection when search term changes

        if (value === '') {
            setShowSearchResultDropdown(false)
            return
        }

        // In semantic mode the dropdown only appears after the user submits (Enter).
        if (isSemantic) {
            return
        }

        setShowSearchResultDropdown(true)
    }

    const handleModeChange = (mode) => {
        setSearchMode(mode)
        setSelectedResultIndex(-1)
        setSubmittedQuery("")
        setShowSearchResultDropdown(mode === "fulltext" && searchTerm !== "")
    }

    const handleKeyDown = (event) => {
        // Ignore keys fired while an IME is composing (e.g. pressing Enter to pick a
        // Chinese candidate), otherwise it would wrongly trigger search/navigation.
        if (event.nativeEvent.isComposing || event.keyCode === 229) {
            return
        }

        const allResults = activeResult.isSuccess ? activeResult.data.pages.flatMap(page => page.data) : []

        if (event.key === 'ArrowDown') {
            if (! showSearchResultDropdown) return
            event.preventDefault()
            setSelectedResultIndex(prev => prev < allResults.length - 1 ? prev + 1 : prev)
        } else if (event.key === 'ArrowUp') {
            if (! showSearchResultDropdown) return
            event.preventDefault()
            setSelectedResultIndex(prev => prev > -1 ? prev - 1 : -1)
        } else if (event.key === 'Enter') {
            const selectedPost = selectedResultIndex >= 0 ? allResults[selectedResultIndex] : null
            if (selectedPost) {
                event.preventDefault()
                navigate(`/single-post?post_id=${selectedPost.id}`)
                setShowSearchBoxComponent(false)
                return
            }

            // Semantic mode: Enter submits the query.
            if (isSemantic && searchTerm.trim() !== '') {
                event.preventDefault()
                setSelectedResultIndex(-1)
                setSubmittedQuery(searchTerm.trim())
                setShowSearchResultDropdown(true)
            }
        }
    }

    useEffect(() => {
        searchBoxInputRef.current.focus()
    })

    return (
        <div
            className={"relative top-20 m-auto w-80 sm:w-7/12 lg:w-1/2 xl:w-1/3 bg-white gap-2 items-center border-4 rounded-xl px-4 py-2 text-xl text-gray-400 focus-within:border-indigo-200"}
            onClick={handleSearchBoxComponentInternallyClicked}>
            {
                isLoggedIn &&
                <div className={"flex items-center gap-1 mb-2 text-sm"}>
                    <button
                        type={"button"}
                        onClick={() => handleModeChange("fulltext")}
                        className={`px-2 py-0.5 rounded ${searchMode === "fulltext" ? "bg-emerald-400 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                        {intl.formatMessage({id: "nav.search_box.mode.fulltext"})}
                    </button>
                    <button
                        type={"button"}
                        onClick={() => handleModeChange("semantic")}
                        className={`px-2 py-0.5 rounded ${searchMode === "semantic" ? "bg-emerald-400 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                        {intl.formatMessage({id: "nav.search_box.mode.semantic"})}
                    </button>
                </div>
            }
            <div className={"flex items-center justify-start gap-2"}>
                <label htmlFor={`${searchBoxInputIdPrefix}-search-box`}>
                    <BsSearch/>
                </label>
                <input
                    id={`${searchBoxInputIdPrefix}-search-box`}
                    type={'text'}
                    ref={searchBoxInputRef}
                    placeholder={intl.formatMessage({id: isSemantic ? "nav.search_box.placeholder.semantic" : "nav.search_box.placeholder"})}
                    className={"border-0 outline-none w-full focus:text-black peer"}
                    onChange={handleSearchBoxInputChanged}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {
                showSearchResultDropdown && activeResult.isSuccess && activeTerm !== '' &&
                <SearchResultDropdown searchTerm={activeTerm} searchedPosts={activeResult}
                                      setShowSearchBoxComponent={setShowSearchBoxComponent}
                                      selectedResultIndex={selectedResultIndex}
                                      paginated={! isSemantic}/>
            }
        </div>
    )
}
