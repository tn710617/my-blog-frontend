import {atom} from "recoil";
import {isLoginInLocalStorage} from "../helpers";

const loginAtom = atom({
    key: 'loginAtom',
    default: isLoginInLocalStorage()
})

export default loginAtom;