import {useMutation, useQuery} from "@tanstack/react-query";
import {ethers} from "ethers";
import {useLocation} from "react-router";
import {isBrowser} from "react-device-detect";
import {getEthersProvider} from "../wallet/getProvider";
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
            // Set auth state to false (Zustand will persist to localStorage automatically)
            setIsLoggedIn(false)
            // Immediately update travel pin popup buttons if function exists
            if (typeof window.updateTravelPinAuthButtons === 'function') {
                window.updateTravelPinAuthButtons(false)
            }
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
            // Use injected provider on desktop, WalletConnect on mobile/no-injected
            const provider = await getEthersProvider()
            // Always request accounts to trigger connect/select prompts
            await provider.send("eth_requestAccounts", [])
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
            // Set auth state to true (Zustand will persist to localStorage automatically)
            setIsLoggedIn(true)
            // Immediately update travel pin popup buttons if function exists
            if (typeof window.updateTravelPinAuthButtons === 'function') {
                window.updateTravelPinAuthButtons(true)
            }
        }, onError: (error, variables, context) => {
            if (error?.message?.includes('Missing VITE_WC_PROJECT_ID')) {
                toast.error('WalletConnect Project ID is missing.')
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
