import getAxios from "./axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import queryString from "query-string";
import {useIntl} from "react-intl";

const axios = getAxios({}, 'v1')

export function useIndexPosts(options = {}, page = 1, categoryId = null, tagIds = [], sort = null, search = null) {
    const intl = useIntl()
    return useQuery(['posts', 'category', categoryId, 'tags', tagIds, 'sort', sort, 'page', page, 'search', search], async () => {
        const queryObject = {
            category_id: categoryId,
            tag_ids: tagIds,
            sort: sort,
            page: page,
            search: search,
            locale: intl.locale
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
        const res = await axios.get(`posts?${query}`)
        return res.data
    }, {
        ...options
    })

}

export function useShowPost(id, options = {}) {
    const intl = useIntl()
    return useQuery(['posts', id], async () => {
        const queryObject = {
            locale: intl.locale
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
        const res = await axios.get(`posts/${id}?${query}`)
        return res.data.data
    }, {
        ...options
    })
}

export function useStorePost() {
    return useMutation(async (data) => {
        const res = await axios.post('posts', data)
        return res.data.data
    })
}

