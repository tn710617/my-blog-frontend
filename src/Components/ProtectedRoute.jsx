import React from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useRecoilState} from "recoil";
import loginAtom from "../States/LoginAtom";
import {useEffect} from "react";
import {isLoginInLocalStorage, loginInLocalStorage, logoutInLocalStorage} from "../helpers";
import {useIsLoggedIn} from "../APIs/auth";

export default function ProtectedRoute({redirectPath = '/'}) {
    const location = useLocation()
    const navigate = useNavigate()
    const [isLoggedInGlobally, setIsLoggedInGlobally] = useRecoilState(loginAtom)

    const handleCheckIsLoggedInSuccess = () => {
        setIsLoggedInGlobally(true)
        loginInLocalStorage()
    }

    useIsLoggedIn({onSuccess: handleCheckIsLoggedInSuccess})

    useEffect(() => {
        if (!isLoginInLocalStorage()) {
            navigate(redirectPath, {state: {from: location}, replace: true});
        }

        if (!isLoggedInGlobally) {
            logoutInLocalStorage()
            navigate(redirectPath, {state: {from: location}, replace: true});
        }
    }, [isLoggedInGlobally, navigate, location, redirectPath])

    return <Outlet/>
}