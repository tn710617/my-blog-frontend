import {atom} from "recoil";

const currentPageAtom = atom({
    key: 'currentPageAtom',
    default: 1
})

export default currentPageAtom