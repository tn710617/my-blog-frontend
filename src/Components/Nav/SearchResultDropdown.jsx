import React from "react";
import NoSearchResult from "./NoSearchResult";
import SearchResult from "./SearchResult";

export default function SearchResultDropdown({searchTerm, searchedPosts, setShowSearchBoxComponent}) {
    console.log("searchedPosts", searchedPosts)
    return (
        <div className={"max-h-screen overflow-y-auto"}>
            <hr className={"mt-1 mb-1"}/>
            {
                searchedPosts.length > 0
                    ?
                    <div className={"mt-2"}>
                        <SearchResult searchedPosts={searchedPosts} setShowSearchBoxComponent={setShowSearchBoxComponent}/>
                    </div>
                    :
                    <div className={"mt-2"}>
                        <NoSearchResult searchTerm={searchTerm}/>
                    </div>
            }
        </div>
    )
}