import axios from "axios";

export default function getAxios(headers = {}, version = '') {
    const baseUrl = process.env.REACT_APP_API_URL + '/' + version

    const commonConfig = {
        baseURL: baseUrl,
        headers: {'Content-Type': 'application/json', ...headers},
        withCredentials: true
    }

    return axios.create({...commonConfig});
}