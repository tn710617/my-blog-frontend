import Nav from "./Nav";
import {Outlet} from "react-router-dom";
import Footer from "./Footer";

export default function Layout() {
    return (
        <div className={"relative flex flex-col justify-between min-h-screen selection:bg-green-300 selection:text-green-900"}>
            <Nav/>
            <Outlet/>
            <Footer/>
        </div>
    )

}