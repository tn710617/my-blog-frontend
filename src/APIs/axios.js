import axios from "axios";

export default function getAxios(headers = {}, version = '') {
    const baseUrl = (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL) + '/' + version

    const commonConfig = {
        baseURL: baseUrl,
        headers: {'Content-Type': 'application/json', ...headers},
        withCredentials: true,
        withXSRFToken: true,
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
    }

    return axios.create({...commonConfig});
}