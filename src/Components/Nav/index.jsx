import logo from "../../Images/favicon-2.png"
import {AiOutlineMenu} from "react-icons/ai";
import {AiOutlineClose} from "react-icons/ai";
import {BsFillMoonStarsFill} from "react-icons/bs";
import {useEffect, useState} from "react";
import {BsFillSunFill} from "react-icons/bs";
import {Link, useLocation} from "react-router";
import {useCategories} from "../../APIs/categories";
import Categories from "./Categories";
import SearchBoxComponent from "./SearchBoxComponent";
import MobileCategories from "./MobileCategories";
import EnhancedMobileNav from "./EnhancedMobileNav";
import {useLoginWithMetaMask, useLogout} from "../../APIs/auth";
import {useAuthStore} from "../../stores";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import AboutButton from "./AboutButton";
import TravelPinsButton from "./TravelPinsButton";
import LocaleDropdown from "./LocaleDropdown";
import TravelPinsSearchBar from "./TravelPinsSearchBar";
import TravelPinsMobileSearchModal from "./TravelPinsMobileSearchModal";
import useScrollDirection from "../../hooks/useScrollDirection";

export default function Nav() {
    const [showMobileNavBar, setShowMobileNavBar] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [showSearchBoxComponent, setShowSearchBoxComponent] = useState(false)
    const [showSearchResultDropdown, setShowSearchResultDropdown] = useState(false)
    const [showMobileSearchModal, setShowMobileSearchModal] = useState(false)

    const location = useLocation()
    const scrollDirection = useScrollDirection()
    const indexCategories = useCategories()
    
    // Check if current page is travel-pins
    const isOnTravelPinsPage = location.pathname === '/travel-pins'

    const handleSearchBoxButtonClick = () => {
        setShowSearchBoxComponent(!showSearchBoxComponent)
        setShowSearchResultDropdown(true)
    }

    useEffect(() => {
        if (showSearchBoxComponent) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

    }, [showSearchBoxComponent])

    const login = useLoginWithMetaMask()
    const logout = useLogout()
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

    return (
        <>
            <div className={`bg-gray-50/80 backdrop-blur-sm z-50 shadow-lg sticky top-0 transition-transform duration-300 ${
                scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
            }`}>
                <nav className={"flex justify-between px-5 py-3 items-center"}>
                    <button
                        type={"button"}
                        className={"xl:hidden text-xl"}
                        onClick={() => setShowMobileNavBar(!showMobileNavBar)}
                    >
                        {showMobileNavBar ? <AiOutlineClose/> : <AiOutlineMenu/>}
                    </button>
                    <div className={"hidden md:flex gap-2 items-center cursor-pointer group relative"}>
                        <img alt={'icon'} src={logo} className={"w-10 rounded"}/>
                        <div className={"text-2xl font-black"}>Learn or Die</div>
                        <Link to={"/"} className={"after:absolute after:inset-0"}/>
                    </div>
                    {
                        indexCategories.isSuccess && !isOnTravelPinsPage &&
                        <Categories categories={indexCategories.data}/>
                    }


                    <div className={"flex gap-5 items-center"}>
                        {/* Travel Pins Search Bar - only show on travel pins page */}
                        {isOnTravelPinsPage && (
                            <>
                                {/* Desktop Search Bar */}
                                <div className="hidden md:block w-80">
                                    <TravelPinsSearchBar 
                                        onLocationSelect={(location) => {
                                            // Dispatch custom event to communicate with TravelPins page
                                            window.dispatchEvent(new CustomEvent('travelPinsLocationSelect', {
                                                detail: location
                                            }));
                                        }}
                                    />
                                </div>
                                {/* Mobile Search Icon */}
                                <button 
                                    onClick={() => {
                                        setShowMobileSearchModal(true);
                                    }}
                                    className="md:hidden group flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.35-4.35"></path>
                                        </svg>
                                    </div>
                                </button>
                            </>
                        )}
                        
                        <div className="hidden xl:flex gap-3">
                            <AboutButton/>
                            <TravelPinsButton/>
                        </div>
                        <LocaleDropdown/>
                        <button className={"cursor-pointer hidden"} onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <BsFillSunFill className={"text-xl hover:text-yellow-400"}/> :
                                <BsFillMoonStarsFill className={"text-lg hover:text-purple-600"}/>}
                        </button>
                        {!isOnTravelPinsPage && (
                            <button 
                                onClick={handleSearchBoxButtonClick}
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 border border-indigo-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                            >
                                <div className="text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="21 21l-4.35-4.35"></path>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-indigo-700 group-hover:text-indigo-800 transition-colors duration-300 hidden xl:inline">
                                    Search
                                </span>
                            </button>
                        )}
                        {
                            isLoggedIn ?
                                <LogoutButton onClick={async () => await logout.mutateAsync()}
                                              isLoading={logout.isPending}/>
                                :
                                <LoginButton onClick={async () => await login.mutateAsync()}
                                             isLoading={login.isPending}/>
                        }
                    </div>
                </nav>
                <div
                    className={`xl:hidden ${showMobileNavBar ? 'block' : 'hidden'}`}>
                    {
                        indexCategories.isSuccess &&
                        <EnhancedMobileNav 
                            categories={indexCategories.data}
                            onNavigate={() => setShowMobileNavBar(false)}
                            showCategories={!isOnTravelPinsPage}
                        />
                    }
                </div>
            </div>
            <SearchBoxComponent showSearchBoxComponent={showSearchBoxComponent}
                                setShowSearchBoxComponent={setShowSearchBoxComponent}
                                showSearchResultDropdown={showSearchResultDropdown}
                                setShowSearchResultDropdown={setShowSearchResultDropdown}/>
            
            {/* Travel Pins Mobile Search Modal */}
            {isOnTravelPinsPage && (
                <TravelPinsMobileSearchModal 
                    isOpen={showMobileSearchModal}
                    onClose={() => setShowMobileSearchModal(false)}
                    onLocationSelect={(location) => {
                        // Dispatch custom event to communicate with TravelPins page
                        window.dispatchEvent(new CustomEvent('travelPinsLocationSelect', {
                            detail: location
                        }));
                    }}
                />
            )}
        </>
    )
}