import {atom} from "recoil";

const postSortAtom = atom({
    key: 'postSortAtom',
    default: 'created_at'
})

export default postSortAtom