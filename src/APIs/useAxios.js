import getAxios from "./axios";
import {useEffect} from "react";
import {useLoginModalStore, useAuthStore} from "../stores";
import {logoutInLocalStorage} from "../helpers";
import {useNavigate} from "react-router-dom";

const version = process.env.REACT_APP_API_VERSION
const normalAxios = getAxios({}, version)
const axiosPrecognitive = getAxios({
    "precognitive": "true"
}, version)

const useAxios = (isPrecognitive = false) => {

    const axios = isPrecognitive ? axiosPrecognitive : normalAxios;
    const navigate = useNavigate()
    const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal)
    const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn)

    useEffect(() => {
        const responseIntercept = axios.interceptors.response.use(response => response,
            async (error) => {
                const prevRequest = error?.config;

                if (error?.response?.status === 401) {
                    if (prevRequest.url !== 'is-logged-in') {
                        setShowLoginModal(true)
                    }
                    setIsLoggedIn(false)
                    logoutInLocalStorage()
                }

                if (error?.response?.status === 403) {
                    navigate('/')
                }
                return Promise.reject(error)
            }
        );

        return () => {
            axios.interceptors.response.eject(responseIntercept);
        }
    }, [axios, setShowLoginModal, setIsLoggedIn, navigate])

    return axios;
}

export default useAxios;