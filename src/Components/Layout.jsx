import Nav from "./Nav";
import {Outlet} from "react-router";
import Footer from "./Footer";
import {Toaster} from "react-hot-toast";
import LoginModal from "./LoginModal";
import CheckLogin from "./CheckLogin";

export default function Layout() {
    return (
        <div
            className={"h-screen relative flex flex-col justify-between selection:bg-green-300 selection:text-green-900"}>
            <div>
                <Nav/>
                <Outlet/>
            </div>
            <Footer/>
            <Toaster/>
            <CheckLogin/>
            <LoginModal/>
        </div>
    )

}