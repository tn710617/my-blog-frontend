import {atom} from "recoil";
import {getLocaleFromLocalStorage} from "../helpers";

const localeAtom = atom({
    key: 'localeAtom',
    default: getLocaleFromLocalStorage() || navigator.language
})

export default localeAtom