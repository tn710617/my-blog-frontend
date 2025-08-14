import {useMutation, useQuery} from "@tanstack/react-query";
import {ethers} from "ethers";
import {useLocation} from "react-router-dom";
import {isBrowser, isMobile} from "react-device-detect";
import {getMetamaskDAppDeepLink, loginInLocalStorage, logoutInLocalStorage} from "../helpers";
import {useAuthStore} from "../stores";
import getAxios from "./axios";
import useAxios from "./useAxios";
import {useIntl} from "react-intl";
import toast from "react-hot-toast";

export function useIsLoggedIn(options = {}) {
    const axios = useAxios()

    return useQuery({
        queryKey: ['is-logged-in'],
        queryFn: async () => {
            await axios.get('is-logged-in')
            return 'success'
        },
        ...options
    })
}

export function useCsrfToken() {
    const axios = getAxios()
    return useMutation({
        mutationFn: async () => {
            const res = await axios.get('csrf-cookie')
            return res.data.data
        }
    })
}

export function useLogout() {
    const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)
    const axios = useAxios()
    return useMutation({
        mutationFn: async () => {
            const res = await axios.post('logout')
            return res.data.data
        },
        onSuccess: (data, variables, context) => {
            setIsLoggedIn(false)
            logoutInLocalStorage()
        }
    })
}

export function useLoginWithMetaMask() {
    const location = useLocation()
    const intl = useIntl()
    const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)
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

            const message = await loginMessage.mutateAsync({locale: intl.locale, provider: provider})

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
        mutationFn: async (data) => {
            const signer = await data.provider.getSigner()

            const address = await signer.getAddress()

            const res = await axios.get('to-be-signed-message', {
                params: {
                    'wallet_address': address,
                    locale: data.locale
                }
            })
            return res.data.data.to_be_signed_message
        }
    })
}
