import {BsFillPenFill} from "react-icons/bs";
import Tagify from "@yaireo/tagify"
import {useRef, useState, useEffect} from "react";
import {BsSave2Fill} from "react-icons/bs";
import {BiReset} from "react-icons/bi";
import {Editor} from '@toast-ui/react-editor';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import {useTags} from "../../APIs/tags";
import {useCategories} from "../../APIs/categories";
import {useStorePost} from "../../APIs/posts";
import PostTitleInput from "./PostTitleInput";
import Modal from "../../Components/Modal";
import {useNavigate} from "react-router-dom";
import {handleStorePostError} from "./handlers";

export default function CreatePost() {

    const [showPostCreatedModal, setShowPostCreatedModal] = useState(false)
    const tagInputRef = useRef();
    const editorRef = useRef()
    const [markdownContentLen, setMarkdownContentLen] = useState(0)
    const defaultForm = {tag_ids: [], post_title: '', post_content: '', category_id: "1"}
    const [form, setForm] = useState(defaultForm)
    const tags = useTags()
    const categories = useCategories()
    const storePost = useStorePost()
    const [postTitleValid, setPostTitleValid] = useState(true)
    const navigate = useNavigate()

    const handleResetButtonClick = (event) => {
        event.preventDefault()
        const editorInstance = editorRef.current.getInstance();
        const tagify = tagInputRef.current.__tagify
        editorInstance.setMarkdown("")
        tagify.removeAllTags()
        setForm(defaultForm)
    }

    const handleStoreButtonSuccess = () => {
        setShowPostCreatedModal(true)
    }

    const handleStoreButtonClick = (event) => {
        event.preventDefault()
        storePost.mutate(form, {
            onError: (error) => handleStorePostError(error, setPostTitleValid),
            onSuccess: handleStoreButtonSuccess
        })
    }

    const handleChange = () => {
        const editorInstance = editorRef.current.getInstance();
        const value = editorInstance.getMarkdown()
        setForm({...form, post_content: value})
        setMarkdownContentLen(value.length)
    };

    const handleTagChange = (event) => {
        if (event.target.value === '') {
            setForm({...form, tag_ids: []})
            return
        }

        const tagNamesArray = JSON.parse(event.target.value).map(tag => tag.value)
        const tagIdsArray = tagNamesArray.map(tag => {
            const tagObjectsArray = tags.data
            return tagObjectsArray.find(tagObject => tagObject.tag_name === tag).id
        })

        setForm({...form, tag_ids: tagIdsArray})
    }

    const handleModalGoBackButtonClick = () => {
        setShowPostCreatedModal(false)
        navigate("/single-post?post_id=" + storePost.data.id)
    }

    useEffect(() => {
        let whitelist = []

        if (tags.status === 'success') {
            whitelist = tags.data.map((tag) => tag.tag_name)
        }

        const tagify = new Tagify(tagInputRef.current, {
            whitelist: whitelist,
            enforceWhitelist: true,
            dropdown: {
                enabled: 1,
            }
        });
        return () => {
            tagify.destroy();
        };
    }, [tags.status, tags.data]);

    return (
        <div className={"m-4 flex justify-center lg:space-x-5"}>
            <Modal title={"成功建立文章"} open={showPostCreatedModal} goBackButtonText={"回到首頁"}
                   handleGoBackButtonClick={handleModalGoBackButtonClick}/>
            <div className={"lg:block hidden lg:w-1/6"}/>
            <div className={"flex flex-col items-center w-full"}>
                <div className={"flex items-center justify-center gap-3 mb-3 text-2xl"}>
                    <BsFillPenFill/>
                    <h1>新增文章</h1>
                </div>
                <form
                    className={"flex flex-col gap-5 rounded-xl shadow-xl w-full m-auto bg-gray-50 px-4 py-7"}>
                    <PostTitleInput form={form} setForm={setForm} isValid={postTitleValid}
                                    setIsValid={setPostTitleValid}/>
                    <select
                        className={"w-full pl-4 h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-0 pl-3 appearance-none"}
                        value={form.category_id}
                        onChange={(event) => setForm({...form, category_id: event.target.value})}
                    >
                        {
                            categories.isSuccess && categories.data.map((category) => {
                                return <option key={category.id} value={category.id}>{category.category_name}</option>
                            })
                        }
                    </select>
                    <div>
                        <input
                            ref={tagInputRef}
                            type={"text"}
                            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-0 px-4"}
                            placeholder={"標籤 (最多 5 個)"}
                            onChange={handleTagChange}
                        >
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
                        <div>{markdownContentLen} / 30000</div>
                        <div className={"flex gap-2"}>
                            <div className={"py-2 px-4 bg-red-500 w-[113px] text-center rounded-lg"} role={"button"}
                                 onClick={handleResetButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}>
                                    <BiReset className={"text-2xl text-white"}/>重置
                                </button>
                            </div>
                            <div className={"py-2 px-4 bg-blue-500 w-[113px] text-center rounded-lg"}
                                 role={"button"}
                                 onClick={handleStoreButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}>
                                    <BsSave2Fill/>儲存
                                </button>
                            </div>

                        </div>

                    </div>

                </form>
            </div>
            <div className={"w-1/6 justify-center lg:block my-auto hidden relative"}>
                <div className={"fixed flex flex-col gap-3"}>
                    <div>{markdownContentLen} / 30000</div>
                    <div className={"p-4 bg-blue-500 inline-block w-[60px] text-center rounded-xl"}
                         role={"button"}
                         onClick={handleStoreButtonClick}
                    >
                        <button className={"text-2xl text-white"}
                        ><BsSave2Fill className={storePost.isLoading ? "animate-spin" : ''}/></button>
                    </div>
                    <div className={"p-3 bg-red-500 inline-block w-[60px] text-center rounded-xl"} role={"button"}
                         onClick={handleResetButtonClick}
                    >
                        <button
                        ><BiReset className={"text-3xl text-white"}/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
