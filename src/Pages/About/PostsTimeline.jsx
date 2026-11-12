import {useEffect, useMemo} from "react";
import {useIntl} from "react-intl";
import {Link} from "react-router";
import {useIndexGroupsPosts} from "../../APIs/posts";
import {useAuthStore} from "../../stores";
import AboutSection from "./AboutSection";
import {summarizeGroupedPosts} from "./Title";

const RECENT_COUNT = 5

// 把 年 → 月 → 文章 的分組攤平,依年、月、日由新到舊排,取前幾篇。
export function latestPosts(groupedPosts, count = RECENT_COUNT) {
    const flat = []
    Object.entries(groupedPosts ?? {}).forEach(([year, yearObj]) => {
        Object.entries(yearObj.months ?? {}).forEach(([month, monthObj]) => {
            Object.values(monthObj.posts ?? {}).forEach(post => {
                flat.push({...post, sortKey: `${year}-${month}-${post.date}`, displayDate: `${year}.${month}.${post.date}`})
            })
        })
    })
    return flat
        .sort((a, b) => b.sortKey.localeCompare(a.sortKey) || b.id - a.id)
        .slice(0, count)
}

// 文章年表:總篇數、最近 5 篇、看全部(決策 16-1 第 3 點)。
export default function PostsTimeline() {
    const intl = useIntl()
    const indexGroupedPosts = useIndexGroupsPosts({})
    const userIsLoggedIn = useAuthStore((state) => state.isLoggedIn)

    useEffect(() => {
        indexGroupedPosts.refetch()
    }, [userIsLoggedIn]);

    const summary = indexGroupedPosts.isSuccess ? summarizeGroupedPosts(indexGroupedPosts.data) : null
    const recent = useMemo(
        () => indexGroupedPosts.isSuccess ? latestPosts(indexGroupedPosts.data) : [],
        [indexGroupedPosts.isSuccess, indexGroupedPosts.data]
    )

    return (
        <AboutSection id={"posts"} title={intl.formatMessage({id: "about.posts_history"})}>
            {summary &&
                <div className={"text-gray-500"}>{intl.formatMessage({id: "about.posts.total"}, {count: summary.total})}</div>}
            <div className={"rounded-xl border p-4 bg-white shadow-lg flex flex-col gap-3"}>
                <h3 className={"font-bold text-lg"}>{intl.formatMessage({id: "about.posts.recent"})}</h3>
                <ul className={"flex flex-col divide-y"}>
                    {recent.map(post => (
                        <li key={post.id}>
                            <Link to={`/single-post?post_id=${post.id}`}
                                  className={"flex gap-4 py-2 items-baseline hover:bg-slate-100 rounded"}>
                                <span className={"text-sm text-gray-400 shrink-0 tabular-nums"}>
                                    {post.displayDate}
                                </span>
                                <span className={"font-semibold"}>{post.post_title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div>
                    <Link to={"/"} className={"text-sm text-blue-600 hover:underline"}>
                        {intl.formatMessage({id: "about.posts.view_all"})} →
                    </Link>
                </div>
            </div>
        </AboutSection>
    )
}
