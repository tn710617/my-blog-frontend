import getAxios from "./axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import queryString from "query-string";
import {useIntl} from "react-intl";
import useAxiosPrivate from "./axiosPrivate";

const axios = getAxios({}, 'v1')

export function useUpdatePost() {
    const axiosPrivate = useAxiosPrivate()
    return useMutation({
        mutationFn: async (data) => {
            console.log('data', data)
            const res = await axiosPrivate.put(`posts/${data.postId}`, data)
            return res.data.data
        },
    })
}

export function useIndexPosts(options = {}, page = 1, categoryId = null, tagIds = [], sort = null, search = null) {
    const intl = useIntl()
    return useQuery(['posts', 'category', categoryId, 'tags', tagIds, 'sort', sort, 'page', page, 'search', search, 'locale', intl.locale], async () => {
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
    return useQuery(['posts', id, 'locale', intl.locale], async () => {
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

