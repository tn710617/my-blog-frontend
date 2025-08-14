import {useInfiniteQuery, useMutation, useQuery} from "@tanstack/react-query";
import queryString from "query-string";
import {useIntl} from "react-intl";
import useAxios from "./useAxios";

export function useIndexGroupsPosts(options = {}) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery({
        queryKey: ['grouped-posts', 'locale', intl.locale],
        queryFn: async () => {
            const queryObject = {
                locale: intl.locale
            }
            const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
            const res = await axios.get(`grouped-posts?${query}`)
            return res.data.data
        },
        ...options
    })
}

export function useDeletePost() {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (postId) => {
            const res = await axios.delete(`posts/${postId}`)
            return res.data.data
        },
    })
}

export function useUpdatePost() {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (data) => {
            const res = await axios.put(`posts/${data.postId}`, data)
            return res.data.data
        },
    })
}

export function useInfinitePosts(options = {}, categoryId = null, tagIds = [], sort = null, search = null) {
    const intl = useIntl()
    const axios = useAxios()
    return useInfiniteQuery(['posts', 'category', categoryId, 'tags', tagIds, 'sort', sort, 'search', search, 'locale', intl.locale], async ({pageParam = 0}) => {
        const queryObject = {
            category_id: categoryId,
            tag_ids: tagIds,
            sort: sort,
            page: pageParam,
            search: search,
            locale: intl.locale
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
        const res = await axios.get(`posts?${query}`)
        return res.data
    }, {
        ...options,
        getNextPageParam: (lastPage) => {
            const currentPage = lastPage.meta.current_page
            const nextPage = currentPage + 1
            const finalPage = lastPage.meta.last_page
            return nextPage > finalPage ? null : nextPage
        }
    })
}

export function useIndexPosts(options = {}, page = 1, categoryId = null, tagIds = [], sort = null, search = null) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery({
        queryKey: ['posts', 'category', categoryId, 'tags', tagIds, 'sort', sort, 'page', page, 'search', search, 'locale', intl.locale],
        queryFn: async () => {
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
        },
        ...options
    })
}

export function useShowPost(id, options = {}) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery({
        queryKey: ['posts', id, 'locale', intl.locale],
        queryFn: async () => {
            const queryObject = {
                locale: intl.locale
            }
            const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
            const res = await axios.get(`posts/${id}?${query}`)
            return res.data.data
        },
        ...options
    })
}

export function useStorePost() {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (data) => {
            const res = await axios.post('posts', data)
            return res.data.data
        }
    })
}