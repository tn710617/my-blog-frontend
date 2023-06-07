import React from "react";
import Modal from "../../Components/Modal";
import {useIntl} from "react-intl";

export default function DeleteConfirmationModal({open, handleGoBackButtonClick, onHide}) {
    const intl = useIntl()
    return (
        <Modal title={intl.formatMessage({id: "show_post.delete_post_confirm_modal.title"})}
               body={intl.formatMessage({id: "show_post.delete_post_confirm_modal.body"})}
               goBackButtonText={intl.formatMessage({id: "show_post.delete_post_confirm_modal.confirm"})}
               open={open}
               handleGoBackButtonClick={handleGoBackButtonClick}
               onHide={onHide}

        />
    )
}