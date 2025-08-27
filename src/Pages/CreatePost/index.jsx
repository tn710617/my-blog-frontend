import React from "react";
import {BsFillPenFill} from "react-icons/bs";
import {useState} from "react";
import {BsSave2Fill} from "react-icons/bs";
import {BiReset} from "react-icons/bi";
import MarkdownEditor from "../../Components/MarkdownEditor";
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
import PublishMediumSelection from "../../Components/PublishMediumSelection";
import {useCreatePostForm} from "../../hooks/useCreatePostForm";
import {useTagifyManager} from "../../hooks/useTagifyManager";

export default function CreatePost() {
    // Navigation and internationalization
    const navigate = useNavigate()
    const intl = useIntl()

    // API queries
    const tags = useTags()
    const categories = useCategories()
    const storePost = useStorePost()

    // Form management with our custom hook
    const { form, setForm, clearForm, markdownContentLen, handleMarkdownChange, hasContent, hasRequiredContent } = useCreatePostForm()

    // Tag management with our reusable hook
    const tagify = useTagifyManager({
        tags: tags.data,
        selectedTagIds: form.tag_ids,
        onTagChange: (tagIds) => setForm({...form, tag_ids: tagIds}),
        placeholder: intl.formatMessage({id: "store_post.post_tags.placeholder"})
    })

    // Local UI state
    const [showPostCreatedModal, setShowPostCreatedModal] = useState(false)
    const [postTitleValid, setPostTitleValid] = useState(true)

    // Event handlers
    const handleResetButtonClick = (event) => {
        event.preventDefault()
        if (!hasContent) return
        clearForm()
    }

    const handleStoreButtonSuccess = () => {
        toast.success(intl.formatMessage({id: 'toast.store_post.post_created'}))
        clearForm()
        navigate('/')
    }

    const handleStoreButtonClick = (event) => {
        event.preventDefault()
        if (!hasRequiredContent) return
        storePost.mutate(form, {
            onError: (error) => handleStorePostError(error, setPostTitleValid),
            onSuccess: handleStoreButtonSuccess
        })
    }

    const handleModalGoBackButtonClick = () => {
        setShowPostCreatedModal(false)
        navigate("/single-post?post_id=" + storePost.data.id)
    }

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
                            ref={tagify.tagInputRef}
                            type={"text"}
                            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-0 px-4"}
                        />
                    </div>
                    <div className={"flex gap-2 justify-between"}>
                        <IsPublicSelect form={form} setForm={setForm}/>
                        <LocaleSelect form={form} setForm={setForm}/>
                        <DateInput form={form} setForm={setForm}/>
                    </div>
                    <div>
                        <MarkdownEditor
                            value={form.post_content}
                            onChange={handleMarkdownChange}
                            height={600}
                        />
                    </div>
                    <div className={"flex justify-between items-center lg:hidden"}>
                        <div>{markdownContentLen} / 30000</div>
                        <div className={"flex gap-2"}>
                            <div
                                className={`py-2 px-4 w-[113px] text-center rounded-lg ${hasContent ? 'bg-red-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                role={"button"}
                                onClick={handleResetButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}
                                        disabled={!hasContent}>
                                    <BiReset
                                        className={"text-2xl text-white"}/>{intl.formatMessage({id: "store_post.reset_button"})}
                                </button>
                            </div>
                            <div
                                className={`py-2 px-4 w-[113px] text-center rounded-lg ${hasRequiredContent && !storePost.isLoading ? 'bg-blue-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                role={"button"}
                                onClick={handleStoreButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}
                                        disabled={!hasRequiredContent || storePost.isLoading}>
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
                    <div
                        className={`p-4 inline-block w-[60px] text-center rounded-xl ${hasRequiredContent && !storePost.isLoading ? 'bg-blue-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                        role={"button"}
                        onClick={handleStoreButtonClick}
                    >
                        <button className={"text-2xl text-white"} disabled={!hasRequiredContent || storePost.isLoading}
                        ><BsSave2Fill className={storePost.isLoading ? "animate-spin" : ''}/></button>
                    </div>
                    <div
                        className={`p-3 inline-block w-[60px] text-center rounded-xl ${hasContent ? 'bg-red-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                        role={"button"}
                        onClick={handleResetButtonClick}
                    >
                        <button disabled={!hasContent}
                        ><BiReset className={"text-3xl text-white"}/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
