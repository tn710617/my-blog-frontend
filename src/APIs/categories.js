import axios from "./axios";
import {useQuery} from "@tanstack/react-query";

export function useCategories(options = {}) {
    return useQuery(['categories'], async () => {
        const res = await axios.get(`categories`)
        return res.data.data
    }, {
        ...options
    })
}