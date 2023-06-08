import React from "react";
import Modal from "./Modal";
import {useRecoilState} from "recoil";
import {useLoginWithMetaMask} from "../APIs/auth";
import loginModalAtom from "../States/loginModalAtom";

export default function LoginModal() {
    const loginWithMetaMask = useLoginWithMetaMask()
    const [showLoginModal, setShowLoginModal] = useRecoilState(loginModalAtom)
    const handleGoBackButtonClick = async () => {
        await loginWithMetaMask.mutateAsync()
        setShowLoginModal(false)
    }
    return (
        <Modal title={"請登入"} open={showLoginModal} handleGoBackButtonClick={handleGoBackButtonClick}
               goBackButtonText={"請按此登入"} body={""}
               isLoading={loginWithMetaMask.isLoading}
               onHide={() => setShowLoginModal(false)}
               type={"info"}
        />
    )
}