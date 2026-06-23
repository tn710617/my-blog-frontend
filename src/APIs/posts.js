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
    return useInfiniteQuery({
        queryKey: ['posts', 'category', categoryId, 'tags', tagIds, 'sort', sort, 'search', search, 'locale', intl.locale],
        queryFn: async ({pageParam}) => {
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
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const currentPage = lastPage.meta.current_page
            const nextPage = currentPage + 1
            const finalPage = lastPage.meta.last_page
            return nextPage > finalPage ? null : nextPage
        },
        ...options
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
export function useSemanticSearchPosts(query = "", options = {}) {
    const intl = useIntl()
    const axios = useAxios()
    return useQuery({
        queryKey: ['semantic-posts', 'query', query, 'locale', intl.locale],
        queryFn: async () => {
            const queryObject = {
                query: query,
                locale: intl.locale
            }
            const queryStr = queryString.stringify(queryObject)
            const res = await axios.get(`posts/semantic-search?${queryStr}`)
            return res.data
        },
        // Shape into the same {pages:[{data}]} structure as the infinite query so the
        // result dropdown/components can be reused. Semantic results are a single top-N page.
        select: (res) => ({pages: [{data: res.data}]}),
        enabled: query !== "",
        // Each query hits the embedding API server-side; reuse the cached result for repeat searches.
        staleTime: 5 * 60 * 1000,
        ...options
    })
}
