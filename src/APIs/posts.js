import axios from "./axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import queryString from "query-string";

export function useIndexPosts(options = {}, page = 1, categoryId = null, tagIds = [], sort = null, search = null) {
    return useQuery(['posts', 'category', categoryId, 'tags', tagIds, 'sort', sort, 'page', page, 'search', search], async () => {
        const queryObject = {
            category_id: categoryId,
            tag_ids: tagIds,
            sort: sort,
            page: page,
            search: search
        }
        const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
        const res = await axios.get(`posts?${query}`)
        return res.data
    }, {
        ...options
    })

}

export function useShowPost(id, options = {}) {
    return useQuery(['posts', id], async () => {
        const res = await axios.get(`posts/${id}`)
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

