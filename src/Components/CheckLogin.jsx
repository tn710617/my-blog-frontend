import {isLoggedInInLocalStorage} from "../helpers";
import {useIsLoggedIn} from "../APIs/auth";

export default function CheckLogin() {
    useIsLoggedIn({enabled: isLoggedInInLocalStorage()});
}