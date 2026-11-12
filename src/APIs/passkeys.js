import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {startAuthentication, startRegistration} from "@simplewebauthn/browser";
import {useIntl} from "react-intl";
import toast from "react-hot-toast";
import {useAuthStore} from "../stores";
import useAxios from "./useAxios";
import {useCsrfToken} from "./auth";

// passkey 登入與管理。流程契約的正本在後端 CLAUDE.md〈Passkey (WebAuthn) authentication〉(決策 5、15),這裡不另寫。
// 這一側刻意不 import 錢包程式(決策 15-1 第 2 點「兩者隔開」),守它的是 Pages/Passkeys/__tests__/Passkeys.test.js 最後一條。

const PASSKEYS_QUERY_KEY = ['passkeys']

// 使用者自己按掉 passkey 選擇視窗、或這台裝置沒有 passkey 時,瀏覽器丟 NotAllowedError;
// 那不是錯誤,停在原畫面就好(決策 15-1 第 3 點:不自動轉去錢包)。
export const isPasskeyCancelled = (error) => error?.name === 'NotAllowedError' || error?.name === 'AbortError'

export function usePasskeyLogin() {
    const intl = useIntl()
    const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)
    const getCsrfToken = useCsrfToken()
    const axios = useAxios()

    return useMutation({
        mutationFn: async () => {
            await getCsrfToken.mutateAsync()
            const {data: optionsJSON} = await axios.post('passkey-login-options')
            const credential = await startAuthentication({optionsJSON})
            await axios.post('login/passkey', credential)
        },
        onSuccess: () => {
            setIsLoggedIn(true)
            if (typeof window.updateTravelPinAuthButtons === 'function') {
                window.updateTravelPinAuthButtons(true)
            }
        },
        onError: (error) => {
            if (isPasskeyCancelled(error)) {
                return
            }
            toast.error(intl.formatMessage({id: 'toast.passkey.login_failed'}))
        }
    })
}

export function usePasskeys() {
    const axios = useAxios()

    return useQuery({
        queryKey: PASSKEYS_QUERY_KEY,
        queryFn: async () => {
            const res = await axios.get('passkeys')
            return res.data.data
        }
    })
}

export function useRegisterPasskey() {
    const intl = useIntl()
    const queryClient = useQueryClient()
    const axios = useAxios()

    return useMutation({
        mutationFn: async () => {
            const {data: optionsJSON} = await axios.post('passkeys/register-options')
            const credential = await startRegistration({optionsJSON})
            const res = await axios.post('passkeys', credential)
            return res.data.data
        },
        onSuccess: () => {
            toast.success(intl.formatMessage({id: 'toast.passkey.added'}))
            return queryClient.invalidateQueries({queryKey: PASSKEYS_QUERY_KEY})
        },
        onError: (error) => {
            if (isPasskeyCancelled(error)) {
                return
            }
            toast.error(intl.formatMessage({id: 'toast.passkey.add_failed'}))
        }
    })
}

export function useRenamePasskey() {
    const queryClient = useQueryClient()
    const axios = useAxios()

    return useMutation({
        mutationFn: async ({id, name}) => {
            const res = await axios.patch(`passkeys/${id}`, {name})
            return res.data.data
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: PASSKEYS_QUERY_KEY})
    })
}

export function useDeletePasskey() {
    const queryClient = useQueryClient()
    const axios = useAxios()

    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`passkeys/${id}`)
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: PASSKEYS_QUERY_KEY})
    })
}
