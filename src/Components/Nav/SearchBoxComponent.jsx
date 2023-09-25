import React, {useEffect} from "react";
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

    useEffect(() => {
        // when ESC key is pressed, close the search box
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                setShowSearchBoxComponent(false)
                setShowSearchResultDropdown(false)
            }
        }
        document.addEventListener('keydown', handleEscKey)
        return () => {
            document.removeEventListener('keydown', handleEscKey)
        }
    }, [setShowSearchBoxComponent, setShowSearchResultDropdown]);

    return (
        <div
            className={`absolute left-0 top-0 w-screen h-screen backdrop-blur-sm z-10 ${showSearchBoxComponent || 'hidden'}`}
            onClick={handleComponentClick}
        >
            <SearchBoxInput showSearchResultDropdown={showSearchResultDropdown}
                            setShowSearchResultDropdown={setShowSearchResultDropdown}
                            setShowSearchBoxComponent={setShowSearchBoxComponent}
            />
        </div>
    )
}