import Nav from "./Nav";
import {Outlet} from "react-router-dom";
import Footer from "./Footer";

export default function Layout() {
    return (
        <div className={""}>
            <Nav/>
            <Outlet/>
            <Footer/>
        </div>
    )

}