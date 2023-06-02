import getAxios from "./axios";
import {useQuery} from "@tanstack/react-query";
const axios = getAxios({}, 'v1')

export function useIndexPopularTags(options = {}) {
    return useQuery(['popular-tags'], async () => {
        const res = await axios.get(`popular-tags`)
        return res.data.data
    }, {
        ...options
    })
}

export function useTags(options = {}) {
    return useQuery(['tags'], async () => {
        const res = await axios.get(`tags`)
        return res.data.data
    }, {
        ...options
    })
}


