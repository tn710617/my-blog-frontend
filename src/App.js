import './App.css';
import {Route, Routes} from "react-router-dom";
import Layout from "./Components/Layout";

function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path={"/"}/>
            </Route>
        </Routes>
    );
}

export default App;
