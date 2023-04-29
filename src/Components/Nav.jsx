import logo from "../Images/favicon.png"
import {GiSpookyHouse} from "react-icons/gi";
import {FcSearch} from "react-icons/fc";
import {BiLogInCircle} from "react-icons/bi";
import {AiOutlineMenu} from "react-icons/ai";
import {AiOutlineClose} from "react-icons/ai";
import {BsFillMoonStarsFill} from "react-icons/bs";
import {useEffect, useState} from "react";
import {BsSearch} from "react-icons/bs";
import {BsFillSunFill} from "react-icons/bs";
import {useRecoilState} from "recoil";
import searchBox from "../States/SearchBox";

export default function Nav() {
    const [showMobileNavBar, setShowMobileNavBar] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [showSearchBox, setShowSearchBox] = useRecoilState(searchBox)

    useEffect(() => {
        if (showSearchBox) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

    }, [showSearchBox])

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
                    <div className={"hidden md:flex gap-2 items-center cursor-pointer"}>
                        <img alt={'icon'} src={logo} className={"w-10"}/>
                        <div className={"text-2xl font-black"}>Learn or Die</div>
                    </div>
                    <div className={"hidden lg:flex gap-4 text-lg text-gray-400"}>
                        <div className={"flex items-center hover:text-blue-400 hover:cursor-pointer relative gap-2"}>
                            <GiSpookyHouse/>
                            <div className={"peer"}>全部文章</div>
                            <span
                                className={"absolute w-full h-1 rounded-full transition-all bg-blue-400 duration-300 top-12 opacity-0 peer-hover:top-11 peer-hover:opacity-100"}></span>
                        </div>
                        <div className={"flex items-center"}>
                            <GiSpookyHouse/>
                            生活記事
                        </div>
                        <div className={"flex items-center"}>
                            <GiSpookyHouse/>
                            程式技術
                        </div>
                    </div>
                    <div className={"flex gap-5 items-center"}>
                        <button className={"cursor-pointer"} onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <BsFillSunFill className={"text-xl hover:text-yellow-400"}/> :
                                <BsFillMoonStarsFill className={"text-lg hover:text-purple-600"}/>}
                        </button>
                        <button className={"cursor-pointer"}
                                onClick={() => setShowSearchBox(!showSearchBox)}>
                            <FcSearch className={"text-4xl p-2 rounded hover:bg-gray-200"}/>
                        </button>
                        <div
                            className={"flex text-emerald-400 items-center gap-2 border border-1 border-green-400 px-3 py-1 rounded-lg cursor-pointer hover:bg-green-400 hover:text-white"}>
                            <BiLogInCircle className={"text-xl"}/>
                            <span className={"text-lg"}>登入</span>
                        </div>
                    </div>
                </nav>
                <div
                    className={`px-3 pb-3 lg:hidden gap-4 text-lg text-gray-400 ${showMobileNavBar ? 'block' : 'hidden'}`}>
                    <div
                        className={"flex rounded-lg px-2 items-center hover:bg-gray-200 hover:text-black hover:cursor-pointer relative gap-2"}>
                        <GiSpookyHouse/>
                        <div className={"peer"}>全部文章</div>
                    </div>
                    <div
                        className={"flex rounded-lg px-2 items-center hover:bg-gray-200 hover:text-black hover:cursor-pointer relative gap-2"}>
                        <GiSpookyHouse/>
                        <div className={"peer"}>全部文章</div>
                    </div>
                </div>
            </div>
            <div
                className={`absolute left-0 top-0 w-screen h-screen backdrop-blur-sm z-10 ${showSearchBox ? '' : 'hidden'}`}
                onClick={() => {
                    setShowSearchBox(false)
                }}
            >
                <div
                    className={"relative top-20 m-auto w-64 sm:w-96 bg-white flex gap-2 items-center border-4 rounded-xl px-4 py-2 text-xl text-gray-400 border hover:border-indigo-200"}>
                    <div>
                        <BsSearch/>
                    </div>
                    <input
                        type={'text'}
                        placeholder={"搜尋文章"}
                        className={"border-0 outline-0 w-full focus:text-black peer"}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                    />
                </div>
            </div>
        </>
    )
}