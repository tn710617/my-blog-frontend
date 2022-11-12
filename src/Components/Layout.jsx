import Nav from "./Nav";
import {Outlet} from "react-router-dom";
import blurAtom from "../States/blur";
import {useRecoilState} from "recoil";

export default function Layout() {
    const [blur] = useRecoilState(blurAtom)
    return (
        <div className={""}>
            <Nav/>
            <Outlet/>
        </div>
    )

}