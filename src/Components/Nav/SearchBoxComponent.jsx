import React from "react";
import SearchBoxInput from "./SearchBoxInput";

export default function SearchBoxComponent({
                                               showSearchBoxComponent,
                                               setShowSearchBoxComponent,
                                               showSearchResultDropdown,
                                               setShowSearchResultDropdown
                                           }) {
    const handleComponentClick = () => {
        setShowSearchBoxComponent(false)
        setShowSearchResultDropdown(false)
    }

    return (
        <div
            className={`absolute left-0 top-0 w-screen h-screen backdrop-blur-sm z-10 ${showSearchBoxComponent ? '' : 'hidden'}`}
            onClick={handleComponentClick}
        >
            <SearchBoxInput showSearchResultDropdown={showSearchResultDropdown}
                            setShowSearchResultDropdown={setShowSearchResultDropdown}
                            setShowSearchBoxComponent={setShowSearchBoxComponent}
            />
        </div>
    )
}