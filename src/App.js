import './App.css';
import {Route, Routes} from "react-router-dom";
import Layout from "./Components/Layout";
import Posts from "./Pages/Posts";
import Create from "./Pages/Create"
import SinglePost from "./Pages/SinglePost";

function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path={"/"} element={<Posts/>}/>
                <Route path={"/create"} element={<Create/>}/>
                <Route path={"/single-post"} element={<SinglePost/>}/>
            </Route>
        </Routes>
    );
}

export default App;
