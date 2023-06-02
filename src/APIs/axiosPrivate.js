import getAxios from "./axios";
import {useEffect} from "react";
import {useRecoilState} from "recoil";
import loginModalAtom from "../States/loginModalAtom";
import {logoutInLocalStorage} from "../helpers";
import loginAtom from "../States/LoginAtom";

const normalAxios = getAxios({}, 'v1')
const axiosPrecognitive = getAxios({
    "precognitive": "true"
}, 'v1')

const useAxiosPrivate = (isPrecognitive = false) => {

    const axios = isPrecognitive ? axiosPrecognitive : normalAxios;
    const [, setShowLoginModal] = useRecoilState(loginModalAtom)
    const [, setIsLoggedIn] = useRecoilState(loginAtom)

    useEffect(() => {
        const responseIntercept = axios.interceptors.response.use(response => response,
            async (error) => {
                if (error?.response?.status === 401) {
                    setShowLoginModal(true)
                    setIsLoggedIn(false)
                    logoutInLocalStorage()
                }
                return Promise.reject(error)
            }
        );

        return () => {
            axios.interceptors.response.eject(responseIntercept);
        }
    }, [axios, setShowLoginModal, setIsLoggedIn])

    return axios;
}

export default useAxiosPrivate;