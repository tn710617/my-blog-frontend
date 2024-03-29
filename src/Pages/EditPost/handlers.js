import toast from "react-hot-toast";
import {clearCachedEditPostForm} from "../../helpers";

export function handleUpdatePostError(error, setPostTitleValid) {
    const errorData = error.response.data
    if (errorData.message === 'The post title has already been taken.') {
        setPostTitleValid(false)
        toast.error('文章標題已經被使用')
    }

    if (errorData.message === 'The post title field is required.') {
        setPostTitleValid(false)
        toast.error('文章標題不能為空')
    }
}

export function handleUpdatePostSuccess(postId, intl, navigate) {
    toast.success(intl.formatMessage({id: 'edit_post.toast_edit_successfully'}))
    clearCachedEditPostForm(postId)
    navigate(`/single-post?post_id=${postId}`)
}
