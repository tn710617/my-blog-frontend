import getAxios from "./axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import {ethers} from "ethers";
import {useLocation} from "react-router-dom";
import {isMobile} from "react-device-detect";
import {getMetamaskDAppDeepLink, loginInLocalStorage, logoutInLocalStorage} from "../helpers";
import {useRecoilState} from "recoil";
import useAxiosPrivate from "./axiosPrivate";
import {useIntl} from "react-intl";
import LoginAtom from "../States/LoginAtom";
import toast from "react-hot-toast";

const axiosV1 = getAxios({}, 'v1')
const axios = getAxios({})

export function useIsLoggedIn() {
    const axiosPrivate = useAxiosPrivate()
    return useQuery(['is-logged-in'], async () => {
        await axiosPrivate.get('is-logged-in')
        return 'success'
    })
}

export async function getCsrfToken() {
    return await axios.get('csrf-cookie')
}

export function useLogout() {
    const [, setIsLoggedIn] = useRecoilState(LoginAtom)
    const axiosPrivate = useAxiosPrivate()
    return useMutation(async () => {
        const res = await axiosPrivate.post('logout')
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

            const message = await getLoginMessage(intl.locale)

            const signature = await signer.signMessage(message)

            await getCsrfToken()

            const res = await axiosV1.post('login/metamask', {
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

export async function getLoginMessage(locale) {
    const res = await axiosV1.get('to-be-signed-message', {
        params: {
            locale: locale
        }
    })
    return res.data.data.to_be_signed_message
}
