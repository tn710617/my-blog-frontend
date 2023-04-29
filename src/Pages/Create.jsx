import {BsFillPenFill} from "react-icons/bs";
import Tagify from "@yaireo/tagify"
import {useRef, useState, useEffect, useCallback} from "react";
import {BsSave2Fill} from "react-icons/bs";
import {BiReset} from "react-icons/bi";
import {Editor} from '@toast-ui/react-editor';
import ReactMarkdown from 'react-markdown';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function Create() {
    const inputRef = useRef();
    const editorRef = useRef()
    const [markdownContent, setMarkdownContent] = useState('');
    const [markdownContentLen, setMarkdownContentLen] = useState(0)

    const handleChange = () => {
        const editorInstance = editorRef.current.getInstance();
        const value = editorInstance.getMarkdown()
        setMarkdownContent(value)
        setMarkdownContentLen(value.length)
    };

    useEffect(() => {
        const tagify = new Tagify(inputRef.current, {
            whitelist: ['tag1', 'tag2', 'tag3'],
            enforceWhitelist: true,
            dropdown: {
                enabled: 1,
            }

        });
        return () => {
            tagify.destroy();
        };
    }, []);

    return (
        <div className={"m-4 flex justify-center lg:space-x-5"}>
            <div className={"lg:block hidden lg:w-1/6"}/>
            <div className={"flex flex-col items-center w-full"}>
                <div className={"flex items-center justify-center gap-3 mb-3 text-2xl"}>
                    <BsFillPenFill/>
                    <h1>新增文章</h1>
                </div>
                <div
                    className={"flex flex-col gap-5 rounded-xl shadow-xl w-full m-auto bg-gray-50 px-4 py-7"}>
                    <input
                        className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4"}
                        placeholder={"文章標題"}/>
                    <div>
                        <select
                            className={"w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-0 pl-3 appearance-none"}>
                            <option>生活雜記</option>
                            <option>程式技術</option>
                        </select>
                        <div className={"absolute right-1 bottom-2 pointer-events-none"}>
                            {/*<svg className="h-8 w-8 text-black" width="24" height="24" viewBox="0 0 24 24"*/}
                            {/*     stroke="currentColor" fill="none">*/}
                            {/*    <path stroke="none" d="M0 0h24v24H0z"/>*/}
                            {/*    <polyline points="6 9 12 15 18 9"/>*/}
                            {/*</svg>*/}
                        </div>
                    </div>
                    <div>
                        <input
                            ref={inputRef}
                            type={"text"}
                            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-0 px-4"}
                            placeholder={"標籤 (最多 5 個)"}>
                        </input>
                    </div>
                    <div>
                        <Editor
                            ref={editorRef}
                            initialValue=" "
                            previewStyle="tab"
                            height="600px"
                            initialEditType="markdown"
                            useCommandShortcut={true}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={"flex justify-between items-center lg:hidden"}>
                        <div>{markdownContentLen} / 20000</div>
                        <div className={"flex gap-2"}>
                            <div className={"py-2 px-4 bg-red-500 w-[113px] text-center rounded-lg"} role={"button"}>
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}><BiReset className={"text-2xl text-white"}/>重置</button>
                            </div>
                            <div className={"py-2 px-4 bg-blue-500 w-[113px] text-center rounded-lg"}
                                 role={"button"}>
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}><BsSave2Fill/>儲存</button>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
            <div className={"w-1/6 justify-center lg:block my-auto hidden relative"}>
                <div className={"fixed flex flex-col gap-3"}>
                    <div>{markdownContentLen} / 20000</div>
                    <div className={"p-4 bg-blue-500 inline-block w-[60px] text-center rounded-xl"}
                         role={"button"}>
                        <button className={"text-2xl text-white "}><BsSave2Fill/></button>
                    </div>
                    <div className={"p-3 bg-red-500 inline-block w-[60px] text-center rounded-xl"} role={"button"}>
                        <button><BiReset className={"text-3xl text-white"}/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
