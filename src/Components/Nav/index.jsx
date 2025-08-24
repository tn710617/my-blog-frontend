import logo from "../../Images/favicon-2.png"
import {FcSearch} from "react-icons/fc";
import {AiOutlineMenu} from "react-icons/ai";
import {AiOutlineClose} from "react-icons/ai";
import {BsFillMoonStarsFill} from "react-icons/bs";
import {useEffect, useState} from "react";
import {BsFillSunFill} from "react-icons/bs";
import {Link} from "react-router";
import {useCategories} from "../../APIs/categories";
import Categories from "./Categories";
import SearchBoxComponent from "./SearchBoxComponent";
import MobileCategories from "./MobileCategories";
import {useLoginWithMetaMask, useLogout} from "../../APIs/auth";
import {useAuthStore} from "../../stores";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import AboutButton from "./AboutButton";
import LocaleDropdown from "./LocaleDropdown";

export default function Nav() {
    const [showMobileNavBar, setShowMobileNavBar] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [showSearchBoxComponent, setShowSearchBoxComponent] = useState(false)
    const [showSearchResultDropdown, setShowSearchResultDropdown] = useState(false)

    const indexCategories = useCategories()

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
            <div className={"bg-gray-50/80 backdrop-blur-sm z-50 shadow-lg sticky top-0"}>
                <nav className={"flex justify-between px-5 py-3 items-center"}>
                    <button
                        type={"button"}
                        className={"lg:hidden text-xl"}
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
                        indexCategories.isSuccess &&
                        <Categories categories={indexCategories.data}/>
                    }


                    <div className={"flex gap-5 items-center"}>
                        <AboutButton/>
                        <LocaleDropdown/>
                        <button className={"cursor-pointer hidden"} onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <BsFillSunFill className={"text-xl hover:text-yellow-400"}/> :
                                <BsFillMoonStarsFill className={"text-lg hover:text-purple-600"}/>}
                        </button>
                        <button className={"cursor-pointer"}
                                onClick={handleSearchBoxButtonClick}>
                            <FcSearch className={"text-4xl p-2 rounded hover:bg-gray-200"}/>
                        </button>
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
                    className={`px-3 pb-3 lg:hidden gap-4 text-lg text-gray-400 ${showMobileNavBar ? 'block' : 'hidden'}`}>
                    {
                        indexCategories.isSuccess &&
                        <MobileCategories categories={indexCategories.data}/>
                    }
                </div>
            </div>
            <SearchBoxComponent showSearchBoxComponent={showSearchBoxComponent}
                                setShowSearchBoxComponent={setShowSearchBoxComponent}
                                showSearchResultDropdown={showSearchResultDropdown}
                                setShowSearchResultDropdown={setShowSearchResultDropdown}/>
        </>
    )
}