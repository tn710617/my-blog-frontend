import {useIntl} from "react-intl";
import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router";
import {useQueryClient} from "@tanstack/react-query";
import {useTags} from "../../APIs/tags";
import {useAuthStore} from "../../stores";
import AboutSection from "./AboutSection";
import {skillGroups} from "./aboutData";

const tagClassName = "inline-block py-1 px-3 border-2 border-blue-400 rounded-2xl text-xs font-semibold bg-slate-200 transition-colors duration-300 cursor-pointer hover:bg-slate-400"

// 點了到首頁、只列帶這個標籤的文章(首頁從網址的 tags 讀標籤)。開新分頁,「關於我」這一頁留在原分頁。
function TagLink({tag}) {
    return (
        <Link to={`/?tags=${tag.id}`} target={"_blank"} rel={"noreferrer"} className={tagClassName}>
            {tag.tag_name}
        </Link>
    )
}

// 技能區:前端一份靜態分組名單(決策 16-1 第 4 點),名單外的標籤收在「全部標籤」;不顯示篇數。
export default function SkillSection() {
    const intl = useIntl()
    const indexTags = useTags()
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const queryClient = useQueryClient()
    const [showAllTags, setShowAllTags] = useState(false)

    useEffect(() => {
        queryClient.invalidateQueries({queryKey: ['tags']})
    }, [isLoggedIn, queryClient]);

    const tagsByName = useMemo(() => {
        const map = new Map()
        if (indexTags.isSuccess) indexTags.data.forEach(tag => map.set(tag.tag_name, tag))
        return map
    }, [indexTags.isSuccess, indexTags.data])

    const unlistedTags = useMemo(() => {
        const listed = new Set(skillGroups.flatMap(group => group.tags))
        return indexTags.isSuccess ? indexTags.data.filter(tag => !listed.has(tag.tag_name)) : []
    }, [indexTags.isSuccess, indexTags.data])

    return (
        <AboutSection id={"skills"} title={intl.formatMessage({id: "about.skill"})}>
            <p>{intl.formatMessage({id: "about.skill_description"})}</p>
            <div className={"grid gap-4 md:grid-cols-2"}>
                {skillGroups.map(group => (
                    <div key={group.id} className={"rounded-xl border p-4 bg-white shadow-lg flex flex-col gap-3"}>
                        <h3 className={"font-bold text-lg"}>{intl.formatMessage({id: `about.skills.group.${group.id}`})}</h3>
                        <ul className={"flex flex-wrap gap-2"}>
                            {group.tags.map(name => {
                                const tag = tagsByName.get(name)
                                return (
                                    <li key={name}>
                                        {tag ? <TagLink tag={tag}/> :
                                            <span className={tagClassName.replace("cursor-pointer hover:bg-slate-400", "")}>{name}</span>}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </div>
            {unlistedTags.length > 0 &&
                <div className={"flex flex-col gap-3"}>
                    <div>
                        <button type={"button"} aria-expanded={showAllTags}
                                onClick={() => setShowAllTags(pre => !pre)}
                                className={"text-sm text-gray-400 hover:text-gray-800"}>
                            {intl.formatMessage({id: showAllTags ? "about.skills.hide_all_tags" : "about.skills.all_tags"})}
                        </button>
                    </div>
                    {showAllTags &&
                        <ul className={"flex flex-wrap gap-2 rounded-xl border p-4 bg-white shadow-lg"}>
                            {unlistedTags.map(tag => <li key={tag.id}><TagLink tag={tag}/></li>)}
                        </ul>
                    }
                </div>
            }
        </AboutSection>
    )
}
