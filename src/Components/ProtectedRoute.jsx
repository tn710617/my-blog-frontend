import React, {useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router";
import {useAuthStore, useLoginModalStore} from "../stores";
import {useEffect} from "react";
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
    }

    useIsLoggedIn({onSuccess: handleCheckIsLoggedInSuccess})

    useEffect(() => {
        // Check auth state from Zustand store (which persists to localStorage automatically)
        if (!isLoggedInGlobally) {
            navigate(redirectPath, {state: {from: location}, replace: true});
            setShowLoginModal(true)
        }

        setIsLoading(false)
    }, [isLoggedInGlobally, navigate, location, redirectPath, setShowLoginModal])

    return isLoading ? null : <Outlet/>
}