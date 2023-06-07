import React from "react";
import {useIntl} from "react-intl";
import {useDeletePost} from "../../APIs/posts";
import {MdDelete} from "react-icons/md";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";


export default function DeleteButton({postId}) {
    const intl = useIntl()
    const deletePost = useDeletePost()
    const navigate = useNavigate()
    const handleDeletePostSuccess = () => {
        toast.success(intl.formatMessage({id: "toast.delete_post.post_deleted"}))
        navigate('/')
    }

    const handleDeleteButtonClick = async () => {
        await deletePost.mutateAsync(postId, {
            onSuccess: handleDeletePostSuccess
        })
    }
    return (
        <button className="flex cursor-pointer hover:text-gray-500 items-center items-center text-gray-400 gap-2"
                onClick={handleDeleteButtonClick}
        >
            <MdDelete className={"text-xl"}/>
            {intl.formatMessage({id: "show_post.delete_button"})}
        </button>
    )
}