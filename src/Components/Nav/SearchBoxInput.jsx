import React, {useEffect} from "react";
import {BsSearch} from "react-icons/bs";
import SearchResultDropdown from "./SearchResultDropdown";
import {useDebounce} from "../../hooks/useDebounce";
import {useInfinitePosts} from "../../APIs/posts";
import {useIntl} from "react-intl";

export default function SearchBoxInput({
                                           showSearchResultDropdown,
                                           setShowSearchResultDropdown,
                                           setShowSearchBoxComponent
                                       }) {
    const searchBoxInputIdPrefix = React.useId()
    const intl = useIntl()
    const [searchTerm, setSearchTerm] = React.useState("")
    const debouncedSearchTerm = useDebounce(searchTerm, 1000)
    const infinitePosts = useInfinitePosts({enabled: debouncedSearchTerm.length !== 0}, null, [], null, debouncedSearchTerm)
    const searchBoxInputRef = React.useRef()

    // click event would bubble up to the parent element, so we need to stop it, otherwise the input would be closed immediately
    const handleSearchBoxComponentInternallyClicked = (event) => {
        event.stopPropagation()
    }

    const handleSearchBoxInputChanged = (event) => {
        setSearchTerm(event.target.value)
        if (event.target.value === '') {
            setShowSearchResultDropdown(false)
            return
        }
        setShowSearchResultDropdown(true)
    }

    useEffect(() => {
        searchBoxInputRef.current.focus()
    })

    return (
        <div
            className={"relative top-20 m-auto w-80 sm:w-7/12 lg:w-1/2 xl:w-1/3 bg-white gap-2 items-center border-4 rounded-xl px-4 py-2 text-xl text-gray-400 focus-within:border-indigo-200"}
            onClick={handleSearchBoxComponentInternallyClicked}>
            <div className={"flex items-center justify-start gap-2"}>
                <label htmlFor={`${searchBoxInputIdPrefix}-search-box`}>
                    <BsSearch/>
                </label>
                <input
                    id={`${searchBoxInputIdPrefix}-search-box`}
                    type={'text'}
                    ref={searchBoxInputRef}
                    placeholder={intl.formatMessage({id: "nav.search_box.placeholder"})}
                    className={"border-0 outline-none w-full focus:text-black peer"}
                    onChange={handleSearchBoxInputChanged}
                />
            </div>
            {
                showSearchResultDropdown && infinitePosts.isSuccess && debouncedSearchTerm !== '' &&
                <SearchResultDropdown searchTerm={debouncedSearchTerm} searchedPosts={infinitePosts}
                                      setShowSearchBoxComponent={setShowSearchBoxComponent}/>
            }
        </div>
    )
}