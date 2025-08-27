import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Tagify from '@yaireo/tagify'

export const useTagifyManager = ({
                                     tags,
                                     selectedTagIds,
                                     onTagChange,
                                     placeholder
                                 }) => {
    const [isTagifyLoaded, setIsTagifyLoaded] = useState(false)

    const tagInputRef = useRef(null)
    const tagifyRef = useRef(null)

    // define: {value: tag_name, id}
    const whitelist = useMemo(
        () => (tags?.length ? tags.map(t => ({value: t.tag_name, id: t.id})) : []),
        [tags]
    )

    const whitelistMapIdToName = useMemo(
        () => new Map(whitelist.map(w => [w.id, w.value])),
        [whitelist]
    )

    const safeParseArray = useCallback((jsonString) => {
        try {
            const parsed = JSON.parse(jsonString)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }, [])

    const handleTagChange = useCallback((e) => {
        if (!onTagChange) return

        const items = e?.detail?.tagify?.value ?? safeParseArray(e?.target?.value ?? '[]')
        const ids = [...new Set(items.map(x => x?.id).filter(id => id != null))]

        onTagChange?.(ids)

    }, [onTagChange, safeParseArray])

    // initialize Tagify
    useEffect(() => {
        if (!tagInputRef.current) return

        tagifyRef.current = new Tagify(tagInputRef.current, {
            whitelist,
            enforceWhitelist: true,
            dropdown: {enabled: 1},
            placeholder: placeholder || '',
        })
        setIsTagifyLoaded(true)

        return () => {
            setIsTagifyLoaded(false)
            tagifyRef.current?.destroy()
            tagifyRef.current = null
        }
    }, [])

    // bind event
    useEffect(() => {
        const tagify = tagifyRef.current
        if (!tagify) return

        tagify.on('change', handleTagChange)
        return () => {
            tagify.off('change', handleTagChange)
        }
    }, [handleTagChange, isTagifyLoaded])

    // hot update whitelist
    useEffect(() => {
        const tagify = tagifyRef.current
        if (!tagify) return

        tagify.settings.whitelist = whitelist
        tagify.whitelist = whitelist
        tagify.dropdown?.hide()
    }, [whitelist, isTagifyLoaded])

    // hot update placeholder
    useEffect(() => {
        const t = tagifyRef.current
        tagInputRef.current?.setAttribute('placeholder', placeholder) // 原生 input（備援）
        if (t) {
            t.settings.placeholder = placeholder                        // 一些路徑會讀 settings
            t.DOM?.input?.setAttribute('placeholder', placeholder)      // ★ 畫面上的 input
        }
    }, [placeholder, isTagifyLoaded])

    // load selected tags
    useEffect(() => {
        const tagify = tagifyRef.current
        if (!tagify || !Array.isArray(selectedTagIds)) return

        const names = selectedTagIds
            .map(id => whitelistMapIdToName.get(id))
            .filter(v => typeof v === 'string' && v.length > 0)

        tagify.removeAllTags()
        if (names.length) tagify.addTags(names)
    }, [isTagifyLoaded, whitelistMapIdToName, selectedTagIds])

    return {
        tagInputRef,
    }
}