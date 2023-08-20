import {useMutation, useQuery} from "@tanstack/react-query";
import {ethers} from "ethers";
import {useLocation} from "react-router-dom";
import {isBrowser, isMobile} from "react-device-detect";
import {getMetamaskDAppDeepLink, loginInLocalStorage, logoutInLocalStorage} from "../helpers";
import {useRecoilState} from "recoil";
import getAxios from "./axios";
import useAxios from "./useAxios";
import {useIntl} from "react-intl";
import LoginAtom from "../States/loginAtom";
import toast from "react-hot-toast";

export function useIsLoggedIn(options = {}) {
    const axios = useAxios()
    return useQuery(['is-logged-in'], async () => {
        await axios.get('is-logged-in')
        return 'success'
    }, {...options})
}

export function useCsrfToken() {
    const axios = getAxios()
    return useMutation(async () => {
        const res = await axios.get('csrf-cookie')
        return res.data.data
    })
}

export function useLogout() {
    const [, setIsLoggedIn] = useRecoilState(LoginAtom)
    const axios = useAxios()
    return useMutation(async () => {
        const res = await axios.post('logout')
        return res.data.data
    }, {
        onSuccess: (data, variables, context) => {
            setIsLoggedIn(false)
            logoutInLocalStorage()
        }
    })
}

export function useLoginWithMetaMask() {
    const location = useLocation()
    const intl = useIntl()
    const [, setIsLoggedIn] = useRecoilState(LoginAtom)
    const getCsrfToken = useCsrfToken()
    const loginMessage = useLoginMessage()
    const axios = useAxios()
    return useMutation({
        mutationFn: async () => {
            if (typeof window.ethereum === 'undefined') {
                if (isMobile) {
                    window.location.replace(getMetamaskDAppDeepLink(location))
                }

                throw new Error('MetaMask is not installed.')
            }

            const provider = new ethers.BrowserProvider(window.ethereum)

            await provider.send("eth_requestAccounts", []);

            const signer = await provider.getSigner()

            const address = await signer.getAddress()

            const message = await loginMessage.mutateAsync(intl.locale)

            const signature = await signer.signMessage(message)

            if (isBrowser) {
                await getCsrfToken.mutateAsync()
            }

            const res = await axios.post('login/metamask', {
                signature: signature,
                address: address
            })

            return res.data.data

        }, onSuccess: (data, variables, context) => {
            setIsLoggedIn(true)
            loginInLocalStorage()
        }, onError: (error, variables, context) => {
            if (error.message === 'MetaMask is not installed.') {
                toast(intl.formatMessage({id: 'toast.login.metaMaskNotInstalled'}))
                return;
            }

            toast.error(intl.formatMessage({id: 'toast.login.unauthenticated'}))
        }
    })
}

export function useLoginMessage() {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (locale) => {
            const res = await axios.get('to-be-signed-message', {
                params: {
                    locale: locale
                }
            })
            return res.data.data.to_be_signed_message
        }
    })
}
