import React from "react";
import Modal from "./Modal";
import {useLoginModalStore} from "../stores";
import {useLoginWithMetaMask} from "../APIs/auth";
import {disconnectWalletSession} from "../wallet/getProvider";
import {useIntl} from "react-intl";

export default function LoginModal() {
    const loginWithMetaMask = useLoginWithMetaMask()
    const intl = useIntl()
    const showLoginModal = useLoginModalStore((state) => state.showLoginModal)
    const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal)
    const handleGoBackButtonClick = async () => {
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
               handleGoBackButtonClick={handleGoBackButtonClick}
               goBackButtonText={intl.formatMessage({id: "login_modal.button_text"})} body={""}
                isLoading={loginWithMetaMask.isPending}
                onHide={() => setShowLoginModal(false)}
               type={"info"}
               secondaryButtonText={intl.formatMessage({id: "login_modal.switch_account"})}
               onSecondaryClick={handleSwitchAccount}
        />
    )
}
