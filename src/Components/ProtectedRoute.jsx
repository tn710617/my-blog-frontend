import React, {useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useRecoilState} from "recoil";
import loginAtom from "../States/loginAtom";
import loginModalAtom from "../States/loginModalAtom";
import {useEffect} from "react";
import {isLoginInLocalStorage, loginInLocalStorage, logoutInLocalStorage} from "../helpers";
import {useIsLoggedIn} from "../APIs/auth";

export default function ProtectedRoute({redirectPath = '/'}) {
    const location = useLocation()
    const navigate = useNavigate()
    const [, setShowLoginModal] = useRecoilState(loginModalAtom)
    const [isLoggedInGlobally, setIsLoggedInGlobally] = useRecoilState(loginAtom)
    const [isLoading, setIsLoading] = useState(true)

    const handleCheckIsLoggedInSuccess = () => {
        setIsLoggedInGlobally(true)
        loginInLocalStorage()
    }

    useIsLoggedIn({onSuccess: handleCheckIsLoggedInSuccess})

    useEffect(() => {
        if (!isLoginInLocalStorage()) {
            navigate(redirectPath, {state: {from: location}, replace: true});
            setShowLoginModal(true)
        }

        if (!isLoggedInGlobally) {
            logoutInLocalStorage()
            navigate(redirectPath, {state: {from: location}, replace: true});
            setShowLoginModal(true)
        }

        setIsLoading(false)
    }, [isLoggedInGlobally, navigate, location, redirectPath, setShowLoginModal])

    return isLoading ? null : <Outlet/>
}