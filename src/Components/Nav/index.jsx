import logo from "../../Images/favicon.png"
import {FcSearch} from "react-icons/fc";
import {BiLogInCircle} from "react-icons/bi";
import {AiOutlineMenu} from "react-icons/ai";
import {AiOutlineClose} from "react-icons/ai";
import {BsFillMoonStarsFill} from "react-icons/bs";
import {useEffect, useState} from "react";
import {BsFillSunFill} from "react-icons/bs";
import {useRecoilState} from "recoil";
import searchBox from "../../States/SearchBox";
import {Link} from "react-router-dom";
import {useCategories} from "../../APIs/categories";
import Categories from "./Categories";
import SearchBoxComponent from "./SearchBoxComponent";
import MobileCategories from "./MobileCategories";
import {useLoginWithMetaMask, useLogout} from "../../APIs/auth";
import {BiLogOut} from "react-icons/bi";
import {isLoginInLocalStorage} from "../../helpers";

export default function Nav() {
    const [showMobileNavBar, setShowMobileNavBar] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [showSearchBoxComponent, setShowSearchBoxComponent] = useRecoilState(searchBox)
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
                        <img alt={'icon'} src={logo} className={"w-10"}/>
                        <div className={"text-2xl font-black"}>Learn or Die</div>
                        <Link to={"/"} className={"after:absolute after:inset-0"}/>
                    </div>
                    {
                        indexCategories.isSuccess &&
                        <Categories categories={indexCategories.data}/>
                    }
                    <div className={"flex gap-5 items-center"}>
                        <button className={"cursor-pointer"} onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <BsFillSunFill className={"text-xl hover:text-yellow-400"}/> :
                                <BsFillMoonStarsFill className={"text-lg hover:text-purple-600"}/>}
                        </button>
                        <button className={"cursor-pointer"}
                                onClick={handleSearchBoxButtonClick}>
                            <FcSearch className={"text-4xl p-2 rounded hover:bg-gray-200"}/>
                        </button>
                        {
                            isLoginInLocalStorage() ?
                                <button
                                    onClick={async () => await logout.mutateAsync({}, {onSuccess: (data) => console.log('成功登出')})}
                                    className={"flex text-red-400 items-center gap-2 border border-1 border-red-400 px-3 py-1 rounded-lg cursor-pointer hover:bg-red-400 hover:text-white"}>
                                    {
                                        logout.isLoading
                                            ? <BiLogOut className={"text-xl animate-spin"}/>
                                            : <BiLogOut className={"text-xl"}/>
                                    }
                                    <span className={"text-lg"}>芝麻關門</span>

                                </button>
                                :
                                <button
                                    onClick={async () => await login.mutateAsync({}, {onSuccess: (data) => console.log('成功登入')})}
                                    className={"flex text-emerald-400 items-center gap-2 border border-1 border-green-400 px-3 py-1 rounded-lg cursor-pointer hover:bg-green-400 hover:text-white"}>
                                    {
                                        login.isLoading
                                            ? <BiLogInCircle className={"text-xl animate-spin"}/>
                                            : <BiLogInCircle className={"text-xl"}/>

                                    }
                                    <span className={"text-lg"}>芝麻開門</span>
                                </button>
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