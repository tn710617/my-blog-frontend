import React, {useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuthStore, useLoginModalStore} from "../stores";
import {useEffect} from "react";
import {isLoggedInInLocalStorage, loginInLocalStorage, logoutInLocalStorage} from "../helpers";
import {useIsLoggedIn} from "../APIs/auth";

export default function ProtectedRoute({redirectPath = '/'}) {
    const location = useLocation()
    const navigate = useNavigate()
    const setShowLoginModal = useLoginModalStore((state) => state.setShowLoginModal)
    const isLoggedInGlobally = useAuthStore((state) => state.isLoggedIn)
    const setIsLoggedInGlobally = useAuthStore((state) => state.setIsLoggedIn)
    const [isLoading, setIsLoading] = useState(true)

    const handleCheckIsLoggedInSuccess = () => {
        setIsLoggedInGlobally(true)
        loginInLocalStorage()
    }

    useIsLoggedIn({onSuccess: handleCheckIsLoggedInSuccess})

    useEffect(() => {
        if (!isLoggedInInLocalStorage()) {
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