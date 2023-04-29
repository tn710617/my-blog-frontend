import {TfiCommentsSmiley} from "react-icons/tfi";
import {GiComputing} from "react-icons/gi";
import {FcCalendar} from "react-icons/fc";
import {FaUser} from "react-icons/fa";
import {AiFillTags} from "react-icons/ai";
import PostBody from "./PostBody";
import {atomDark} from "react-syntax-highlighter/src/styles/prism";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {CopyToClipboard} from "react-copy-to-clipboard";
import {useState} from "react";
import fakeMarkdownContent from "./fakeMarkdownContent";

export default function SinglePost() {

    const content = fakeMarkdownContent()

    const [markdownContent, setMarkdownContent] = useState(content)

    return (
        <div className={"m-4 flex lg:space-x-5"}>
            <div className={"lg:block hidden lg:w-1/6"}/>
            <div className={"flex flex-col gap-4 rounded-xl shadow-xl w-full m-auto bg-gray-50 px-4 py-7"}>
                <div className={"font-semibold text-4xl"}>aaa</div>
                <div className={"flex flex-wrap items-center text-gray-400 gap-3"}>
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
                <div className={"flex flex-wrap items-center gap-2"}>
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
                </div>
                <PostBody content={markdownContent}/>
            </div>
            <div className={"w-1/6 justify-center lg:block my-auto hidden relative"}>
            </div>
        </div>
    )
}
