import axios from "axios";

const baseUrl = process.env.REACT_APP_API_URL;

const commonConfig = {
    baseURL: baseUrl,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true
}

export default axios.create(commonConfig);