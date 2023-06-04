import React from "react";
import {AiFillEdit} from "react-icons/ai";
import {useIntl} from "react-intl";
import {Link} from "react-router-dom";

export default function EditButton({postId}) {
    const intl = useIntl()
    return (
        <Link to={`/edit-post?post_id=${postId}`}
              className="flex cursor-pointer hover:text-gray-500 items-center items-center text-gray-400 gap-2">
            <AiFillEdit className={"text-xl"}/>
            {intl.formatMessage({id: "show_post.edit_button"})}
        </Link>
    )
}