import {atom} from "recoil";
import {isLoggedInInLocalStorage} from "../helpers";

const loginAtom = atom({
    key: 'loginAtom',
    default: isLoggedInInLocalStorage()
})

export default loginAtom;