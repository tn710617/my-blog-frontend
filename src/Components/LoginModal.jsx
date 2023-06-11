import React from "react";
import Modal from "./Modal";
import {useRecoilState} from "recoil";
import {useLoginWithMetaMask} from "../APIs/auth";
import {useIntl} from "react-intl";
import loginModalAtom from "../States/loginModalAtom";

export default function LoginModal() {
    const loginWithMetaMask = useLoginWithMetaMask()
    const intl = useIntl()
    const [showLoginModal, setShowLoginModal] = useRecoilState(loginModalAtom)
    const handleGoBackButtonClick = async () => {
        await loginWithMetaMask.mutateAsync()
        setShowLoginModal(false)
    }
    return (
        <Modal title={intl.formatMessage({id: "login_modal.title"})} open={showLoginModal}
               handleGoBackButtonClick={handleGoBackButtonClick}
               goBackButtonText={intl.formatMessage({id: "login_modal.button_text"})} body={""}
               isLoading={loginWithMetaMask.isLoading}
               onHide={() => setShowLoginModal(false)}
               type={"info"}
        />
    )
}