import toast from "react-hot-toast";

export function handleStorePostError(error, setPostTitleValid) {
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
