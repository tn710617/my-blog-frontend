import getAxios from "./axios";
import {useQuery} from "@tanstack/react-query";
import {useIntl} from "react-intl";
import queryString from "query-string";

const axios = getAxios({}, 'v1')

export function useIndexPopularTags(options = {}) {
    const intl = useIntl()
    return useQuery(['popular-tags', 'locale', intl.locale], async () => {
        const queryObject = {
            locale: intl.locale
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
        const res = await axios.get(`popular-tags?${query}`)
        return res.data.data
    }, {
        ...options
    })
}

export function useTags(options = {}) {
    const intl = useIntl()
    return useQuery(['tags', 'locale', intl.locale], async () => {
        const queryObject = {
            locale: intl.locale
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
        const res = await axios.get(`tags?${query}`)
        return res.data.data
    }, {
        ...options
    })
}


