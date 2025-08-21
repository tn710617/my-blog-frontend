import React from "react";
import {BsFillPenFill} from "react-icons/bs";
import Tagify from "@yaireo/tagify"
import {useRef, useState, useEffect, useMemo} from "react";
import {BsSave2Fill} from "react-icons/bs";
import {BiReset} from "react-icons/bi";
import {Editor} from '@toast-ui/react-editor';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import {useTags} from "../../APIs/tags";
import {useCategories} from "../../APIs/categories";
import {useUpdatePost, useShowPost} from "../../APIs/posts";
import {useQueryClient} from "@tanstack/react-query";
import PostTitleInput from "../../Components/PostTitleInput";
import {useNavigate} from "react-router";
import {handleUpdatePostError, handleUpdatePostSuccess} from "./handlers";
import DateInput from "../../Components/DateInput";
import IsPublicSelect from "../../Components/IsPublicSelect";
import {useIntl} from "react-intl";
import LocaleSelect from "../../Components/LocaleSelect";
import CategorySelection from "../../Components/CategorySelection";
import {useSearchParams} from "react-router";
import dayjs from "dayjs";
import {useEditPostFormStore} from "../../stores";
import PublishMediumSelection from "../../Components/PublishMediumSelection";

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

    // Use Zustand store for user edits only
    const forms = useEditPostFormStore((state) => state.forms)
    const setFormInternal = useEditPostFormStore((state) => state.setForm)
    const clearForm = useEditPostFormStore((state) => state.clearForm)

    // Get cached form (user edits only)
    const cachedForm = useMemo(() => {
        return forms[postId] || null
    }, [forms, postId])

    // Check if user has made any edits (cached form exists)
    const hasUnsavedChanges = cachedForm !== null

    // Display form: cached data (if user edited) OR server data (for display only)
    const displayForm = useMemo(() => {
        // Use cached form if user has edited
        if (cachedForm) {
            return cachedForm
        }

        // Derive from server data for display (NOT stored in Zustand)
        if (showPost.data) {
            return {
                tag_ids: showPost.data.tags.map(tag => tag.id),
                post_title: showPost.data.post_title,
                post_content: showPost.data.post_content,
                category_id: showPost.data.category_id,
                is_public: showPost.data.is_public,
                locale: showPost.data.locale,
                created_at: dayjs(showPost.data.created_at).toISOString().slice(0, -1),
                should_publish_medium: showPost.data.should_publish_medium || false,
            }
        }

        // Fallback for initial render before data loads
        return {
            tag_ids: [],
            post_title: '',
            post_content: '',
            category_id: "",
            is_public: true,
            locale: "zh-TW",
            created_at: "",
            should_publish_medium: false,
        }
    }, [cachedForm, showPost.data])

    // Helper function to create hash from form data
    // Normalizes both server data and display form to same structure before hashing
    const createFormHash = (data, isServerData = false) => {
        const normalizedData = {
            tag_ids: isServerData ?
                [...data.tags.map(tag => tag.id)].sort() : // Server: extract IDs from tag objects
                [...data.tag_ids].sort(), // Display form: use tag_ids directly
            post_title: data.post_title,
            post_content: data.post_content,
            category_id: data.category_id,
            is_public: data.is_public,
            locale: data.locale,
            created_at: isServerData ?
                dayjs(data.created_at).toISOString().slice(0, -1) : // Server: normalize date format
                data.created_at, // Display form: already normalized
            should_publish_medium: data.should_publish_medium || false
        }
        return JSON.stringify(normalizedData)
    }

    // Function to check if display form is identical to server data
    const isDisplayFormIdenticalToServerData = useMemo(() => {
        if (!showPost.data) return false

        const serverHash = createFormHash(showPost.data, true) // true = isServerData
        const displayHash = createFormHash(displayForm, false) // false = isDisplayForm

        return serverHash === displayHash
    }, [displayForm, showPost.data])

    // Check if form data differs from server data
    const shouldPersistForm = (formData) => {
        if (!showPost.data) return false// No server data to compare, persist anyway

        const serverHash = createFormHash(showPost.data, true)
        const formHash = createFormHash(formData, false)

        return serverHash !== formHash // Persist when different from server
    }

    // Wrapper for components that expect setForm(newFormObject)
    // Always updates local state, conditionally persists based on shouldPersistForm
    const setForm = (newForm, shouldPersist = null) => {
        // If shouldPersist is explicitly provided, use it; otherwise check against server data
        const persist = shouldPersist !== null ? shouldPersist : shouldPersistForm(newForm)

        if (!persist) {
            clearForm(postId)
        }

        if (persist) {
            setFormInternal(postId, newForm)
        } else {
            // Don't persist, but the displayForm will still update via useMemo
        }
    }

    const tags = useTags()
    const categories = useCategories()
    const [postTitleValid, setPostTitleValid] = useState(true)
    const navigate = useNavigate()
    const intl = useIntl()


    const handleResetButtonClick = (event) => {
        event.preventDefault()

        // Only allow reset if there are unsaved changes
        if (!hasUnsavedChanges) {
            return
        }

        // Reset UI state and clear cached form
        // This will cause useEffect to repopulate from existing showPost.data
        setIsTagInputLoaded(false)
        setIsMarkdownLoaded(false)
        setResetNumber(prev => prev + 1)
        clearForm(postId)
        // Note: No server reload needed - uses existing showPost.data
    }

    const handleUpdateButtonClick = async (event) => {
        event.preventDefault()

        // Only allow update if there are unsaved changes
        if (!hasUnsavedChanges) {
            return
        }

        const data = {
            ...displayForm,
            postId
        }
        await updatePost.mutateAsync(data, {
            onSuccess: () => handleUpdatePostSuccess(postId, intl, navigate, clearForm),
            onError: (error) => handleUpdatePostError(error, setPostTitleValid),
        })
    }

    const handleChange = () => {
        const editorInstance = editorRef.current.getInstance();
        const value = editorInstance.getMarkdown()
        setForm({...displayForm, post_content: value})
        setMarkdownContentLen(value.length)
    };

    const handleTagChange = (event) => {
        if (event.target.value === '') {
            setForm({...displayForm, tag_ids: []})
            return
        }

        const tagNamesArray = JSON.parse(event.target.value).map(tag => tag.value)
        const tagIdsArray = tagNamesArray.map(tag => {
            const tagObjectsArray = tags.data
            return tagObjectsArray.find(tagObject => tagObject.tag_name === tag).id
        })

        setForm({...displayForm, tag_ids: tagIdsArray})
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

    // Clear cached form when display form becomes identical to server data
    useEffect(() => {
        if (isDisplayFormIdenticalToServerData && cachedForm) {
            clearForm(postId)
        }
    }, [isDisplayFormIdenticalToServerData, cachedForm, postId, clearForm, showPost])

    useEffect(() => {
        function loadTagInputFromCachedPost() {
            const tagIdsArray = displayForm.tag_ids
            const tagNamesArray = tagIdsArray.map(tagId => {
                const tagObjectsArray = tags.data
                return tagObjectsArray.find(tagObject => tagObject.id === tagId).tag_name
            })

            const tagify = tagInputRef.current.__tagify
            tagify.removeAllTags()
            tagify.addTags(tagNamesArray)
            setIsTagInputLoaded(true)
        }

        function loadTagInputFromShowPost() {
            const tagify = tagInputRef.current.__tagify
            tagify.removeAllTags()
            tagify.addTags(showPost.data.tags.map(tag => tag.tag_name))
            setIsTagInputLoaded(true)
        }

        if (tags.status === 'success' && showPost.status === 'success' && isTagifyLoaded) {
            if (hasUnsavedChanges) {
                loadTagInputFromCachedPost()
                return
            }

            loadTagInputFromShowPost()
        }

    }, [tags.status, tags.data, showPost.data?.tags, isTagifyLoaded, showPost.status, hasUnsavedChanges, displayForm.tag_ids])

    useEffect(() => {
        function loadMarkdownInputFromCachedPost() {
            const editorInstance = editorRef.current.getInstance()
            const currentContent = editorInstance.getMarkdown()

            // Only update if content actually changed
            if (currentContent !== displayForm.post_content) {
                editorInstance.setMarkdown(displayForm.post_content)
            }
            setIsMarkdownLoaded(true)
        }

        function loadMarkdownInputFromShowPost() {
            const editorInstance = editorRef.current.getInstance()
            const currentContent = editorInstance.getMarkdown()

            // Only update if content actually changed
            if (currentContent !== showPost.data.post_content) {
                editorInstance.setMarkdown(showPost.data.post_content)
            }
            setIsMarkdownLoaded(true)
        }

        if (showPost.status === 'success' && isTagInputLoaded) {
            if (hasUnsavedChanges) {
                loadMarkdownInputFromCachedPost()
                return
            }

            loadMarkdownInputFromShowPost()
        }
    }, [showPost.status, editorRef, resetNumber, isTagInputLoaded, showPost.data, hasUnsavedChanges, displayForm.post_content])

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
                            ref={tagInputRef}
                            type={"text"}
                            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:outline-0 px-4"}
                            placeholder={intl.formatMessage({id: "store_post.post_tags.placeholder"})}
                            onChange={handleTagChange}
                        >
                        </input>
                    </div>
                    <div className={"flex gap-2 justify-between"}>
                        <IsPublicSelect form={displayForm} setForm={setForm}/>
                        <LocaleSelect form={displayForm} setForm={setForm}/>
                        <DateInput form={displayForm} setForm={setForm}/>
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
                                className={`py-2 px-4 w-[113px] text-center rounded-lg ${hasUnsavedChanges && !updatePost.isLoading ? 'bg-blue-500 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                                role={"button"}
                                onClick={handleUpdateButtonClick}
                            >
                                <button className={"text-2xl text-white flex justify-center items-center gap-2"}
                                        disabled={!hasUnsavedChanges || updatePost.isLoading}>
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
