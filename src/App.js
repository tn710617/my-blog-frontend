import './App.css';
import {Route, Routes} from "react-router-dom";
import Layout from "./Components/Layout";
import Posts from "./Pages/Posts";
import SinglePost from "./Pages/SinglePost";
import CreatePost from "./Pages/CreatePost";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditPost from "./Pages/EditPost";

function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path={"/"} element={<Posts/>}/>
                <Route element={<ProtectedRoute/>}>
                    <Route path={"/create-post"} element={<CreatePost/>}/>
                    <Route path={"/edit-post"} element={<EditPost/>}/>
                </Route>
                <Route path={"/single-post"} element={<SinglePost/>}/>
                <Route path="*" element={<Posts/>}/>
            </Route>
        </Routes>
    );
}

export default App;
