import {useAuthStore} from "../stores";
import {useIsLoggedIn} from "../APIs/auth";

export default function CheckLogin() {
    // Get auth state from Zustand store (which persists to localStorage automatically)
    const isLoggedInLocally = useAuthStore((state) => state.isLoggedIn);
    useIsLoggedIn({enabled: isLoggedInLocally});
}