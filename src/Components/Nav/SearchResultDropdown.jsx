import React from "react";
import NoSearchResult from "./NoSearchResult";
import SearchResult from "./SearchResult";
import LoadMorePageComponent from "../LoadMorePageComponent";
import {useIntl} from "react-intl";

export default function SearchResultDropdown({searchTerm, searchedPosts, setShowSearchBoxComponent}) {
    const hasPosts = searchedPosts.data.pages[0].data.length !== 0
    const intl = useIntl()

    return (
        <div className={"max-h-[80vh] overflow-y-auto"}>
            <hr className={"mt-1 mb-1"}/>
            {
                hasPosts
                    ?
                    <div>
                        <div className={"mt-2"}>
                            <SearchResult searchedPosts={searchedPosts}
                                          setShowSearchBoxComponent={setShowSearchBoxComponent}/>
                        </div>
                        <div className={"mt-2 text-center"}>
                            <LoadMorePageComponent pagination={searchedPosts}
                                                   loadMoreText={intl.formatMessage({id: "load_more_page_component.load_more_button"})}
                                                   lastPageText={intl.formatMessage({id: "load_more_page_component.is_last_page"})}
                                                   loadingText={intl.formatMessage({id: "load_more_page_component.is_loading"})}
                            />

                        </div>
                    </div>
                    :
                    <div className={"mt-2"}>
                        <NoSearchResult searchTerm={searchTerm}/>
                    </div>
            }
        </div>
    )
}