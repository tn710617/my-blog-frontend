import React, {useEffect, useState} from "react";
import Modal from "./Modal";
import Spinner from "./Spinner";
import {useLoginModalStore} from "../stores";
import {useLoginWithMetaMask} from "../APIs/auth";
import {usePasskeyLogin} from "../APIs/passkeys";
import {disconnectWalletSession} from "../wallet/getProvider";
import {useIntl} from "react-intl";

// 登入小視窗(決策 15-1 第 3 點):主按鈕是 passkey;錢包登入(含手機 WalletConnect、切換帳號)收在
// 「改用錢包登入」底下,點了才展開。passkey 取消或失敗時停在原畫面,不自動轉去錢包。
export default function LoginModal() {
    const loginWithPasskey = usePasskeyLogin()
    const loginWithMetaMask = useLoginWithMetaMask()
    const intl = useIntl()
    const showLoginModal = useLoginModalStore((state) => state.showLoginModal)
    const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal)
    const [showWalletOptions, setShowWalletOptions] = useState(false)

    useEffect(() => {
        if (!showLoginModal) {
            setShowWalletOptions(false)
        }
    }, [showLoginModal])

    const handlePasskeyLogin = async () => {
        try {
            await loginWithPasskey.mutateAsync()
            setShowLoginModal(false)
        } catch (e) {
            // usePasskeyLogin 已經處理提示;這裡只負責停在原畫面
        }
    }

    const handleWalletLogin = async () => {
        await loginWithMetaMask.mutateAsync()
        setShowLoginModal(false)
    }

    const handleSwitchAccount = async () => {
        try {
            // Desktop extension: re-prompt account permissions UI
            const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
            if (typeof window !== 'undefined' && window.ethereum && !isMobile) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_requestPermissions',
                        params: [{ eth_accounts: {} }]
                    })
                    // Prompt account list (and ensure selected account is updated)
                    await window.ethereum.request({ method: 'eth_requestAccounts' })
                } catch (e) {
                    // ignore; user may cancel
                }
            } else {
                // WalletConnect (mobile): disconnect existing session to force fresh selection
                await disconnectWalletSession()
            }
            await loginWithMetaMask.mutateAsync()
            setShowLoginModal(false)
        } catch (e) {
            // Keep modal open on error
            console.warn('Switch account flow failed', e)
        }
    }

    return (
        <Modal title={intl.formatMessage({id: "login_modal.title"})} open={showLoginModal}
               handleGoBackButtonClick={handlePasskeyLogin}
               goBackButtonText={intl.formatMessage({id: "login_modal.passkey_button"})} body={""}
               isLoading={loginWithPasskey.isPending}
               onHide={() => setShowLoginModal(false)}
               type={"info"}
        >
            <div className="mt-4 border-t border-gray-100 pt-3">
                {
                    showWalletOptions
                        ? <div className="space-y-2">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                onClick={handleWalletLogin}
                            >
                                {loginWithMetaMask.isPending ? <Spinner/> : intl.formatMessage({id: "login_modal.button_text"})}
                            </button>
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                onClick={handleSwitchAccount}
                            >
                                {intl.formatMessage({id: "login_modal.switch_account"})}
                            </button>
                        </div>
                        : <button
                            type="button"
                            className="w-full text-center text-sm text-gray-500 underline-offset-4 hover:text-indigo-600 hover:underline"
                            onClick={() => setShowWalletOptions(true)}
                        >
                            {intl.formatMessage({id: "login_modal.use_wallet"})}
                        </button>
                }
            </div>
        </Modal>
    )
}
