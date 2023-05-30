import React, {useMemo} from "react";
import {useTags} from "../../APIs/tags";

const DISPLAY_POPULAR_TAGS = 10

export default function PopularTags({tags, setTags}) {
    const indexTags = useTags()
    const [showMoreTags, setShowMoreTags] = React.useState(false)

    const popularTags = useMemo(() => {
        if (indexTags.status === 'success')
            return indexTags.data.slice(0, DISPLAY_POPULAR_TAGS)
    }, [indexTags.status, indexTags.data])

    const displayedTags = useMemo(() => {
        if (indexTags.status === 'success') {
            if (showMoreTags)
                return indexTags.data
            else
                return popularTags
        }
    }, [showMoreTags, indexTags.status, indexTags.data, popularTags])

    const isSelectedTag = (id) => {
        return tags.includes(id.toString())
    }

    const getTagClass = (id) => {
        const defaultClass = "py-1 px-3 border border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 transition-colors duration-300 cursor-pointer"

        const variableClass = isSelectedTag(id) ? " bg-slate-400" : " hover:bg-slate-400"

        return defaultClass + variableClass
    }

    const handleTagClick = (e) => {
        const id = e.target.value
        if (isSelectedTag(id)) {
            setTags((preTags) => {
                return preTags.filter(tagId => tagId !== id)
            })
        } else {
            setTags(preTags => {
                return [...preTags, id]
            })
        }
    }

    return (
        <div className={"flex flex-wrap gap-2"}>
            {
                indexTags.isSuccess &&
                displayedTags.map(({id, tag_name}) => {
                    return (
                        <button key={id}
                                className={getTagClass(id)}
                                value={id} onClick={handleTagClick}
                        >
                            {tag_name}
                        </button>
                    )
                })
            }
            <button className={"text-gray-400 hover:text-gray-800"} onClick={() => setShowMoreTags(pre => !pre)}>
                {showMoreTags ? 'show less tags ...' : 'show more tags ...'}
            </button>
        </div>
    )
}