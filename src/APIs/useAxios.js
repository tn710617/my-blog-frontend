import getAxios from "./axios";
import {useEffect} from "react";
import {useRecoilState} from "recoil";
import loginModalAtom from "../States/loginModalAtom";
import {logoutInLocalStorage} from "../helpers";
import loginAtom from "../States/loginAtom";
import {useNavigate} from "react-router-dom";

const version = process.env.REACT_APP_API_VERSION
const normalAxios = getAxios({}, version)
const axiosPrecognitive = getAxios({
    "precognitive": "true"
}, version)

const useAxios = (isPrecognitive = false) => {

    const axios = isPrecognitive ? axiosPrecognitive : normalAxios;
    const navigate = useNavigate()
    const [, setShowLoginModal] = useRecoilState(loginModalAtom)
    const [, setIsLoggedIn] = useRecoilState(loginAtom)

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