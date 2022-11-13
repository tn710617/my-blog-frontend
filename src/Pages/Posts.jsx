import {MdArticle} from "react-icons/md";
import {MdUpdate} from "react-icons/md";
import {TfiCommentsSmiley} from "react-icons/tfi";
import {AiFillTags} from "react-icons/ai";
import {GiComputing} from "react-icons/gi";
import {FcCalendar} from "react-icons/fc";
import {FaUser} from "react-icons/fa";
import {BsFillPenFill} from "react-icons/bs";

export default function Posts() {

    return (
        <div className={"flex mx-3 flex-col items-center lg:flex-row lg:items-start lg:justify-center mt-8 gap-6 mb-12"}>
            <div className={"w-full md:w-[700px]"}>
                <div className={"flex flex-col-reverse gap-4 md:flex-row md:gap-0 justify-between"}>
                    <div className={"flex flex-row justify-items-start items-center bg-gray-300 rounded-xl px-1 py-1"}>
                        <div
                            className={"flex items-center m-0 gap-1 py-2 rounded-xl pl-4 pr-4 cursor-pointer hover:bg-white"}>
                            <MdArticle/>
                            最新文章
                        </div>
                        <div
                            className={"flex items-center m-0 gap-1 px-4 rounded-xl py-2 cursor-pointer hover:bg-white"}>
                            <MdUpdate/>
                            最近更新
                        </div>
                        <div
                            className={"flex items-center m-0 gap-1 py-2 px-4 rounded-xl cursor-pointer hover:bg-white"}>
                            <TfiCommentsSmiley/>
                            最多留言
                        </div>
                    </div>
                    <div
                        className={"flex flex-row justify-end items-center border border-0 border-black border-b-2 pl-8 mb-1"}>
                        <span className={"font-bold"}>程式技術:</span><span className={"text-sm"}>程式學習日記</span>
                    </div>
                </div>
                {
                    [...Array(10)].map((p, i) => {
                        return (
                            <div className={"mt-6 p-6 rounded-xl bg-white shadow-xl"}>
                                <div className={"cursor-pointer group"}>
                                    <div
                                        className={"font-bold text-xl mb-2 border border-0 border-b-2 border-b-transparent group-hover:border-blue-400"}>PhpStorm
                                        上跑 pest/phpunit 測試, sail 版本
                                    </div>
                                    <p className={"text-gray-400 group-hover:text-gray-500"}>## # 遇到的問題 已經設定過這樣的連線有好幾次經驗了,
                                        但今天卻卡了一天, 遇到一個問題, 那就是試過任何方法,
                                        只要涉及到測試資料庫的 DB 連線, 就會跳 `php_network_getaddresses: getaddrinfo for mysql
                                        failed:...</p>

                                </div>
                                <div className={"flex mt-4 flex-wrap items-center gap-2"}>
                                    <AiFillTags className={"text-xl text-gray-400 cursor-pointer"}/>
                                    {
                                        [...Array(10)].map((e, i) => {
                                            return (
                                                <div
                                                    className={"py-1 px-3 border border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 transition-colors duration-300 cursor-pointer"}>
                                                    {Math.random().toString(36).slice(7)}
                                                </div>
                                            )
                                        })

                                    }
                                    <div
                                        className={"py-1 px-3 border border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 transition-colors duration-300 cursor-pointer"}>
                                        PHPSTORM
                                    </div>
                                </div>
                                <div className={"mt-4 flex flex-wrap items-center text-gray-400 gap-3"}>
                                    <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                                        <GiComputing/>
                                        <span className={"ml-2"}>程式技術</span>
                                    </div>
                                    <span>•</span>
                                    <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                                        <FaUser/>
                                        <span className={"ml-2"}>Ray</span>
                                    </div>
                                    <span>•</span>
                                    <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                                        <FcCalendar/>
                                        <span className={"ml-2"}>2022-10-17</span>
                                    </div>
                                    <span>•</span>
                                    <div className={"flex cursor-pointer hover:text-gray-500 items-center"}>
                                        <TfiCommentsSmiley/>
                                        <span className={"ml-2"}>0</span>
                                    </div>
                                </div>
                            </div>

                        )
                    })
                }
            </div>
            <div>
                <div className={"md:w-[700px] lg:w-[300px] border border-2 rounded-xl border-green-500 p-4 bg-white shadow-lg"}>
                    <h1 className={"text-center font-semibold text-lg pb-2 border border-black border-0 border-b-2 capitalize"}>
                        learan or die
                    </h1>
                    <p className={"mt-4"}>
                        The value of life lies not in the length of days, but in the use we make of them
                        <br/>
                        人生的價值不在長短，在於每個沒有遺憾的當下。
                    </p>
                    <button
                        className={"flex cursor-pointer border bg-emerald-500 w-full py-2 px-2 rounded-lg mt-6 items-center justify-center gap-2 text-gray-100 hover:bg-blue-500 transition-colors duration-500"}>
                        <BsFillPenFill/>
                        <span className={"font-semibold text-lg"}>寫一篇</span>
                    </button>
                </div>
                <div className={"md:w-[700px] lg:w-[300px] rounded-xl p-4 bg-white mt-5 shadow-lg"}>
                    <div
                        className={"flex justify-center border border-black border-0 border-b-2 pb-2 items-center gap-1"}>
                        <AiFillTags className={"text-xl"}/>
                        <h1 className={"font-semibold text-lg capitalize"}>
                            熱門標籤
                        </h1>
                    </div>
                    <div className={"mt-4 flex flex-wrap gap-2"}>
                        {
                            [...Array(10)].map((e, i) => {
                                return (
                                    <div
                                        className={"py-1 px-3 border border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 transition-colors duration-300 cursor-pointer"}>
                                        {Math.random().toString(36).slice(7)}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
