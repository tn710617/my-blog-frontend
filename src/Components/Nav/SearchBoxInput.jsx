import React from "react";
import {BsSearch} from "react-icons/bs";
import SearchResultDropdown from "./SearchResultDropdown";
import {DebounceInput} from "react-debounce-input";
import {useIndexPosts} from "../../APIs/posts";
import {useIntl} from "react-intl";

export default function SearchBoxInput({showSearchResultDropdown, setShowSearchResultDropdown, setShowSearchBoxComponent}) {
    const searchBoxInputIdPrefix = React.useId()
    const intl = useIntl()
    const [searchTerm, setSearchTerm] = React.useState("")
    const indexPosts = useIndexPosts({}, 1, null, [], null, searchTerm)

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

    return (
        <div
            className={"relative top-20 m-auto w-80 sm:w-7/12 lg:w-1/2 xl:w-1/3 bg-white gap-2 items-center border-4 rounded-xl px-4 py-2 text-xl text-gray-400 border hover:border-indigo-200"}
            onClick={handleSearchBoxComponentInternallyClicked}>
            <div className={"flex items-center justify-start gap-2"}>
                <label htmlFor={`${searchBoxInputIdPrefix}-search-box`}>
                    <BsSearch/>
                </label>
                <DebounceInput
                    id={`${searchBoxInputIdPrefix}-search-box`}
                    type={'text'}
                    placeholder={intl.formatMessage({id: "nav.search_box.placeholder"})}
                    className={"border-0 outline-none w-full focus:text-black peer"}
                    onChange={handleSearchBoxInputChanged}
                    debounceTimeout={1000}
                    forceNotifyByEnter={true}
                />
            </div>
            {
                showSearchResultDropdown && indexPosts.isSuccess && searchTerm !== '' &&
                <SearchResultDropdown searchTerm={searchTerm} searchedPosts={indexPosts.data.data} setShowSearchBoxComponent={setShowSearchBoxComponent}/>
            }
        </div>
    )
}