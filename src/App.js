import './App.css';
import {Route, Routes} from "react-router-dom";
import Layout from "./Components/Layout";
import Posts from "./Pages/Posts";

function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path={"/"} element={<Posts/>}/>
            </Route>
        </Routes>
    );
}

export default App;
