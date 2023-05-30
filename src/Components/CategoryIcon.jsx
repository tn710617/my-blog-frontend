import React from "react";
import {GiEvilBook} from "react-icons/gi";
import {ImHome} from "react-icons/im";
import {MdComputer} from "react-icons/md";

const ALL = 1
const CODING = 2
const LIFE = 3

export default function CategoryIcon({category_id}) {
    switch (category_id) {
        case ALL:
            return <ImHome/>
        case CODING:
            return <MdComputer className={"text-xl"}/>
        case LIFE:
            return <GiEvilBook className={"text-xl"}/>
        default:
            return <ImHome/>
    }
}
