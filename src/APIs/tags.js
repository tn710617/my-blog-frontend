import {useQuery} from "@tanstack/react-query";
import {useIntl} from "react-intl";
import queryString from "query-string";
import useAxios from "./useAxios";

export function useIndexPopularTags(options = {}) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery({
        queryKey: ['popular-tags', 'locale', intl.locale],
        queryFn: async () => {
            const queryObject = {
                locale: intl.locale
            }
            const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
            const res = await axios.get(`popular-tags?${query}`)
            return res.data.data
        },
        ...options
    })
}

export function useTags(options = {}) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery({
        queryKey: ['tags', 'locale', intl.locale],
        queryFn: async () => {
            const queryObject = {
                locale: intl.locale
            }
            const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
            const res = await axios.get(`tags?${query}`)
            return res.data.data
        },
        ...options
    })
}


