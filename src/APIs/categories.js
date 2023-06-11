import queryString from "query-string";
import {useQuery} from "@tanstack/react-query";
import {useIntl} from "react-intl";
import useAxios from "./useAxios";

export function useCategories(options = {}) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery(['categories', 'locale', intl.locale], async () => {
        const queryObject = {
            locale: intl.locale,
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})

        const res = await axios.get(`categories?${query}`)
        return res.data.data
    }, {
        ...options
    })
}