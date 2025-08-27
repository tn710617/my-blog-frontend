import React, {useEffect} from "react";
import {BsFillPenFill} from "react-icons/bs";
import {useState} from "react";
import {BsSave2Fill} from "react-icons/bs";
import {BiReset} from "react-icons/bi";
import MarkdownEditor from "../../Components/MarkdownEditor";
import {useTags} from "../../APIs/tags";
import {useCategories} from "../../APIs/categories";
import {useUpdatePost, useShowPost} from "../../APIs/posts";
import PostTitleInput from "../../Components/PostTitleInput";
import {useNavigate} from "react-router";
import {handleUpdatePostError, handleUpdatePostSuccess} from "./handlers";
import DateInput from "../../Components/DateInput";
import IsPublicSelect from "../../Components/IsPublicSelect";
import {useIntl} from "react-intl";
import LocaleSelect from "../../Components/LocaleSelect";
import CategorySelection from "../../Components/CategorySelection";
import {useSearchParams} from "react-router";
import PublishMediumSelection from "../../Components/PublishMediumSelection";
import {useEditPostForm} from "../../hooks/useEditPostForm";
import {useTagifyManager} from "../../hooks/useTagifyManager";

export default function EditPost() {
    // Route and navigation
    const [searchParams] = useSearchParams()
    const postId = searchParams.get("post_id")
    const navigate = useNavigate()
    const intl = useIntl()

    // API queries
    const showPost = useShowPost(postId, {enabled: !!postId})
    const updatePost = useUpdatePost()
    const tags = useTags()
    const categories = useCategories()

    // Form management with caching
    const {displayForm, hasUnsavedChanges, setForm, clearForm} = useEditPostForm(
        postId,
        showPost.data
    )

    // Tag management
    const tagify = useTagifyManager({
        tags: tags.data,
        selectedTagIds: displayForm.tag_ids,
        onTagChange: (tagIds) => setForm({...displayForm, tag_ids: tagIds}),
        placeholder: intl.formatMessage({id: "store_post.post_tags.placeholder"})
    })

    // Local state
    const [postTitleValid, setPostTitleValid] = useState(true)
    const [markdownContentLen, setMarkdownContentLen] = useState(displayForm.post_content?.length || 0)

    // Event handlers
    const handleResetButtonClick = (event) => {
        event.preventDefault()
        if (!hasUnsavedChanges) return

        clearForm()
    }

    const handleUpdateButtonClick = async (event) => {
        event.preventDefault()
        if (!hasUnsavedChanges) return

        const data = {...displayForm, postId}
        await updatePost.mutateAsync(data, {
            onSuccess: () => handleUpdatePostSuccess(postId, intl, navigate, clearForm),
            onError: (error) => handleUpdatePostError(error, setPostTitleValid),
        })
    }

    const handleMarkdownChange = (value = "") => {
        setForm({...displayForm, post_content: value})
        setMarkdownContentLen(value.length)
    }

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
                    <PostTitleInput form={displayForm} setForm={setForm} isValid={postTitleValid}
                                    setIsValid={setPostTitleValid}/>
                    <div className={"flex gap-2"}>
                        <CategorySelection form={displayForm} setForm={setForm} categories={categories}/>
                        <PublishMediumSelection form={displayForm} setForm={setForm}/>
                    </div>
                    <div>
                        <input
                            ref={tagify.tagInputRef}
                            type={"text"}
                            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-0 px-4"}
                        />
                    </div>
                    <div className={"flex gap-2 justify-between"}>
                        <IsPublicSelect form={displayForm} setForm={setForm}/>
                        <LocaleSelect form={displayForm} setForm={setForm}/>
                        <DateInput form={displayForm} setForm={setForm}/>
                    </div>
                    <div>
                        <MarkdownEditor
                            value={displayForm.post_content}
                            onChange={handleMarkdownChange}
                            height={600}
                        />
                    </div>
                    <div className={"flex justify-between items-center lg:hidden"}>
                        <div>{markdownContentLen} / 30000</div>
                        <div className={"flex gap-2"}>
                            <div
                                className={`py-2 px-4 w-[113px] text-center rounded-lg ${hasUnsavedChanges ? 'bg-red-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                role={"button"}
                                onClick={handleResetButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}
                                        disabled={!hasUnsavedChanges}>
                                    <BiReset
                                        className={"text-2xl text-white"}/>{intl.formatMessage({id: "store_post.reset_button"})}
                                </button>
                            </div>
                            <div
                                className={`py-2 px-4 w-[113px] text-center rounded-lg ${hasUnsavedChanges && !updatePost.isPending ? 'bg-blue-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                role={"button"}
                                onClick={handleUpdateButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}
                                        disabled={!hasUnsavedChanges || updatePost.isPending}>
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
                        className={`p-4 inline-block w-[60px] text-center rounded-xl ${hasUnsavedChanges && !updatePost.isLoading ? 'bg-blue-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                        role={"button"}
                        onClick={handleUpdateButtonClick}
                    >
                        <button className={"text-2xl text-white"} disabled={!hasUnsavedChanges || updatePost.isLoading}
                        ><BsSave2Fill className={updatePost.isLoading ? "animate-spin" : ''}/></button>
                    </div>
                    <div
                        className={`p-3 inline-block w-[60px] text-center rounded-xl ${hasUnsavedChanges ? 'bg-red-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                        role={"button"}
                        onClick={handleResetButtonClick}
                    >
                        <button disabled={!hasUnsavedChanges}
                        ><BiReset className={"text-3xl text-white"}/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
