import './App.css';
import {Route, Routes} from "react-router";
import Layout from "./Components/Layout";
import Posts from "./Pages/Posts";
import SinglePost from "./Pages/SinglePost";
import CreatePost from "./Pages/CreatePost";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditPost from "./Pages/EditPost";
import About from "./Pages/About";
import TravelPinsNew from "./Pages/TravelPinsNew";
import PositionDemoPage from "./Pages/Demo/PositionDemo";

function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path={"/"} element={<Posts/>}/>
                <Route path={"/about"} element={<About/>}/>
                <Route path={"/travel-pins-new"} element={<TravelPinsNew/>}/>
                <Route path={"/demo/css-position"} element={<PositionDemoPage/>}/>
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
