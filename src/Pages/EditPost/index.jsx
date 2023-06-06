import React from "react";
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
import {useUpdatePost, useShowPost} from "../../APIs/posts";
import PostTitleInput from "../../Components/PostTitleInput";
import {useNavigate} from "react-router-dom";
import {handleUpdatePostError, handleUpdatePostSuccess} from "./handlers";
import DateInput from "../../Components/DateInput";
import IsPublicSelect from "../../Components/IsPublicSelect";
import {useIntl} from "react-intl";
import LocaleSelect from "../../Components/LocaleSelect";
import CategorySelection from "../../Components/CategorySelection";
import {useSearchParams} from "react-router-dom";
import dayjs from "dayjs";

export default function EditPost() {
    const [isTagifyLoaded, setIsTagifyLoaded] = useState(false)
    const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false)
    const [isTagInputLoaded, setIsTagInputLoaded] = useState(false)
    const [resetNumber, setResetNumber] = useState(1)
    const [searchParams] = useSearchParams()
    const postId = searchParams.get("post_id")
    const showPost = useShowPost(postId, {
        enabled: !!postId,
    })
    const updatePost = useUpdatePost()
    const tagInputRef = useRef();
    const editorRef = useRef()
    const [markdownContentLen, setMarkdownContentLen] = useState(0)

    const defaultForm = {
        tag_ids: [],
        post_title: '',
        post_content: '',
        category_id: "",
        is_public: true,
        locale: "zh-TW",
        created_at: ""
    }

    const [form, setForm] = useState(defaultForm)
    const tags = useTags()
    const categories = useCategories()
    const [postTitleValid, setPostTitleValid] = useState(true)
    const navigate = useNavigate()
    const intl = useIntl()

    const handleResetButtonClick = (event) => {
        event.preventDefault()
        setIsTagInputLoaded(false)
        setIsMarkdownLoaded(false)
        setResetNumber(prev => prev + 1)
    }

    const handleUpdateButtonClick = async (event) => {
        event.preventDefault()
        const data = {
            ...form,
            postId
        }
        await updatePost.mutateAsync(data, {
            onSuccess: () => handleUpdatePostSuccess(postId, intl, navigate),
            onError: (error) => handleUpdatePostError(error, setPostTitleValid),
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


    useEffect(() => {
        if (tags.status === 'success') {
            const whitelist = tags.data.map((tag) => tag.tag_name)
            const tagify = new Tagify(tagInputRef.current, {
                whitelist: whitelist,
                enforceWhitelist: true,
                dropdown: {
                    enabled: 1,
                }
            });

            setIsTagifyLoaded(true)

            return () => {
                tagify.destroy()
            }
        }
    }, [tags.status, tags.data]);

    useEffect(() => {
        if (tags.status === 'success' && showPost.status === 'success' && isTagifyLoaded) {
            const tagify = tagInputRef.current.__tagify
            tagify.removeAllTags()
            tagify.addTags(showPost.data.tags.map(tag => tag.tag_name))
            setIsTagInputLoaded(true)
        }

    }, [tags.status, tags.data, showPost.data, resetNumber, isTagifyLoaded, setIsTagInputLoaded, showPost.status])

    useEffect(() => {
        if (showPost.status === 'success' && isTagInputLoaded) {
            editorRef.current.getInstance().setMarkdown(showPost.data.post_content)
            setIsMarkdownLoaded(true)
        }
    }, [showPost.status, editorRef, resetNumber, isTagInputLoaded, setIsMarkdownLoaded, showPost.data])

    useEffect(() => {
        if (showPost.status === 'success' && isMarkdownLoaded) {
            setForm(prev => {
                return {
                    ...prev,
                    tag_ids: showPost.data.tag_ids,
                    post_title: showPost.data.post_title,
                    post_content: showPost.data.post_content,
                    category_id: showPost.data.category_id,
                    is_public: showPost.data.is_public,
                    locale: showPost.data.locale,
                    created_at: dayjs(showPost.data.created_at).toISOString().slice(0, -1),
                }
            })
        }

    }, [showPost.status, showPost.data, resetNumber, isMarkdownLoaded])


    return (
        <div className={"m-4 flex justify-center lg:space-x-5"}>
            <div className={"lg:block hidden lg:w-1/6 xl:w-2/6"}/>
            <div className={"flex flex-col items-center w-full m-auto"}>
                <div className={"flex items-center justify-center gap-3 mb-3 text-2xl"}>
                    <BsFillPenFill/>
                    <h1>{intl.formatMessage({id: "edit_post.title"})}</h1>
                </div>
                <form
                    className={"flex flex-col gap-5 rounded-xl shadow-xl w-full m-auto bg-gray-50 px-4 py-7"}>
                    <PostTitleInput form={form} setForm={setForm} isValid={postTitleValid}
                                    setIsValid={setPostTitleValid}/>
                    <CategorySelection form={form} setForm={setForm} categories={categories}/>
                    <div>
                        <input
                            ref={tagInputRef}
                            type={"text"}
                            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-0 px-4"}
                            placeholder={intl.formatMessage({id: "store_post.post_tags.placeholder"})}
                            onChange={handleTagChange}
                        >
                        </input>
                    </div>
                    <div className={"flex gap-2 justify-between"}>
                        <IsPublicSelect form={form} setForm={setForm}/>
                        <LocaleSelect form={form} setForm={setForm}/>
                        <DateInput form={form} setForm={setForm}/>
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
                                    <BiReset
                                        className={"text-2xl text-white"}/>{intl.formatMessage({id: "store_post.reset_button"})}
                                </button>
                            </div>
                            <div className={"py-2 px-4 bg-blue-500 w-[113px] text-center rounded-lg"}
                                 role={"button"}
                                 onClick={handleUpdateButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}>
                                    <BsSave2Fill/>{intl.formatMessage({id: "store_post.save_button"})}
                                </button>
                            </div>

                        </div>

                    </div>

                </form>
            </div>
            <div className={"lg:w-1/6 xl:w-2/6 justify-center lg:block my-auto hidden relative"}>
                <div className={"fixed flex flex-col gap-3"}>
                    <div>{markdownContentLen} / 30000</div>
                    <div className={"p-4 bg-blue-500 inline-block w-[60px] text-center rounded-xl"}
                         role={"button"}
                         onClick={handleUpdateButtonClick}
                    >
                        <button className={"text-2xl text-white"}
                        ><BsSave2Fill className={updatePost.isLoading ? "animate-spin" : ''}/></button>
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
