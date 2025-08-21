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
import PostTitleInput from "../../Components/PostTitleInput";
import Modal from "../../Components/Modal";
import {useNavigate} from "react-router";
import {handleStorePostError} from "./handlers";
import DateInput from "../../Components/DateInput";
import IsPublicSelect from "../../Components/IsPublicSelect";
import {useIntl} from "react-intl";
import LocaleSelect from "../../Components/LocaleSelect";
import CategorySelection from "../../Components/CategorySelection";
import toast from "react-hot-toast";
import {usePostFormStore} from "../../stores";
import PublishMediumSelection from "../../Components/PublishMediumSelection";

export default function CreatePost() {
    const [isTagifyLoaded, setIsTagifyLoaded] = useState(false)
    const [, setIsMarkdownLoaded] = useState(false)
    const [isTagInputLoaded, setIsTagInputLoaded] = useState(false)
    const [showPostCreatedModal, setShowPostCreatedModal] = useState(false)
    const tagInputRef = useRef();
    const editorRef = useRef()
    const [markdownContentLen, setMarkdownContentLen] = useState(0)
    
    const form = usePostFormStore((state) => state.form)
    const setFormInternal = usePostFormStore((state) => state.setForm)
    const clearForm = usePostFormStore((state) => state.clearForm)
    
    // Compatibility wrapper for components that expect setForm(newFormObject)
    const setForm = (newForm) => setFormInternal(newForm)
    const tags = useTags()
    const categories = useCategories()
    const storePost = useStorePost()
    const [postTitleValid, setPostTitleValid] = useState(true)
    const navigate = useNavigate()
    const intl = useIntl()

    const handleResetButtonClick = (event) => {
        event.preventDefault()
        const editorInstance = editorRef.current.getInstance();
        const tagify = tagInputRef.current.__tagify
        editorInstance.setMarkdown("")
        tagify.removeAllTags()
        clearForm()
    }

    const handleStoreButtonSuccess = () => {
        toast.success(intl.formatMessage({id: 'toast.store_post.post_created'}))
        clearForm()
        navigate('/')
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
        function initTagify() {
            const whitelist = tags.data.map((tag) => tag.tag_name)
            const tagify = new Tagify(tagInputRef.current, {
                whitelist: whitelist,
                enforceWhitelist: true,
                dropdown: {
                    enabled: 1,
                }
            });

            setIsTagifyLoaded(true)

            return tagify
        }

        if (tags.status === 'success') {
            const tagify = initTagify()

            return () => {
                tagify.destroy()
            }
        }
    }, [tags.status, tags.data]);

    useEffect(() => {
        function loadTagInput() {
            const tagIdsArray = form.tag_ids
            const tagNamesArray = tagIdsArray.map(tagId => {
                const tagObjectsArray = tags.data
                return tagObjectsArray.find(tagObject => tagObject.id === tagId).tag_name
            })

            const tagify = tagInputRef.current.__tagify
            tagify.removeAllTags()
            tagify.addTags(tagNamesArray)
            setIsTagInputLoaded(true)
        }

        if (tags.status === 'success' && isTagifyLoaded) {
            loadTagInput()
        }

    }, [tags.status, tags.data, isTagifyLoaded, setIsTagInputLoaded])

    useEffect(() => {
        function loadMarkdownInput() {
            editorRef.current.getInstance().setMarkdown(form.post_content)
            setIsMarkdownLoaded(true)
        }

        if (isTagInputLoaded) {
            loadMarkdownInput()
        }
    }, [editorRef, isTagInputLoaded, setIsMarkdownLoaded])

    return (
        <div className={"m-4 flex justify-center lg:space-x-5"}>
            <Modal title={intl.formatMessage({id: "store_post.post_created_modal.title"})} open={showPostCreatedModal}
                   goBackButtonText={intl.formatMessage({id: "store_post.post_created_modal.back_button_text"})}
                   handleGoBackButtonClick={handleModalGoBackButtonClick}/>
            <div className={"lg:block hidden lg:w-1/6 xl:w-2/6"}/>
            <div className={"flex flex-col items-center w-full m-auto"}>
                <div className={"flex items-center justify-center gap-3 mb-3 text-2xl"}>
                    <BsFillPenFill/>
                    <h1>{intl.formatMessage({id: "store_post.title"})}</h1>
                </div>
                <form
                    className={"flex flex-col gap-5 rounded-xl shadow-xl w-full m-auto bg-gray-50 px-4 py-7"}>
                    <PostTitleInput form={form} setForm={setForm} isValid={postTitleValid}
                                    setIsValid={setPostTitleValid}/>
                    <div className={"flex gap-2"}>
                        <CategorySelection form={form} setForm={setForm} categories={categories}/>
                        <PublishMediumSelection form={form} setForm={setForm}/>
                    </div>
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
                                 onClick={handleStoreButtonClick}
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
