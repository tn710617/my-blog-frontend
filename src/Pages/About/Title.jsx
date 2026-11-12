import {useIntl} from "react-intl";
import {BsEnvelope, BsLinkedin, BsMedium} from "react-icons/bs";
import avatar from "./logo.png"
import {getContacts} from "./aboutData";
import {getWorkExperiencesZhTw} from "./WorkExperiencesZhTw";
import portfolioData from "./portfolioData.json";
import {useIndexGroupsPosts} from "../../APIs/posts";

// 文章年表的資料(各年 article_count)加總成篇數、取最早的一年;數字跟著實際公開文章走,不寫死。
export function summarizeGroupedPosts(groupedPosts) {
    const years = Object.keys(groupedPosts ?? {})
    if (years.length === 0) return null
    return {
        total: years.reduce((sum, year) => sum + Number(groupedPosts[year].article_count || 0), 0),
        since: years.sort()[0],
    }
}

export default function Title() {
    const intl = useIntl()
    const contacts = getContacts()
    const groupedPosts = useIndexGroupsPosts({})
    const summary = groupedPosts.isSuccess ? summarizeGroupedPosts(groupedPosts.data) : null

    const contactLinks = [
        contacts.email && {key: "email", href: `mailto:${contacts.email}`, icon: <BsEnvelope/>},
        contacts.linkedin && {key: "linkedin", href: contacts.linkedin, icon: <BsLinkedin/>},
        contacts.medium && {key: "medium", href: contacts.medium, icon: <BsMedium/>},
    ].filter(Boolean)

    const stats = [
        summary && intl.formatMessage({id: "about.stats.since"}, {year: summary.since}),
        summary && intl.formatMessage({id: "about.stats.posts"}, {count: summary.total}),
        intl.formatMessage({id: "about.stats.experiences"}, {count: getWorkExperiencesZhTw().length}),
        intl.formatMessage({id: "about.stats.portfolios"}, {count: portfolioData.zh_TW.length}),
    ].filter(Boolean)

    return (
        <header className={"flex flex-col md:flex-row items-center gap-6"}>
            <img className={"rounded-xl xl:w-48 xl:h-48 md:w-36 md:h-36 w-24 h-24 object-cover shrink-0"} src={avatar}
                 alt={"avatar"}/>
            <div className={"flex flex-col items-center md:items-start gap-3 text-center md:text-left"}>
                <h1 className={"font-bold text-4xl"}>{intl.formatMessage({id: "about.name"})}</h1>
                <div className={"text-2xl"}>{intl.formatMessage({id: "about.job_title"})}</div>
                <p className={"text-gray-700 max-w-2xl"}>{intl.formatMessage({id: "about.position"})}</p>
                <div className={"flex flex-wrap justify-center md:justify-start gap-2"}>
                    {contactLinks.map(({key, href, icon}) => (
                        <a key={key} href={href} target={key === "email" ? undefined : "_blank"} rel={"noreferrer"}
                           className={"flex items-center gap-2 py-1 px-3 border-2 border-blue-400 rounded-2xl text-sm font-semibold bg-slate-200 transition-colors duration-300 hover:bg-slate-400"}>
                            {icon}
                            <span>{intl.formatMessage({id: `about.contact.${key}`})}</span>
                        </a>
                    ))}
                </div>
                <ul className={"flex flex-wrap justify-center md:justify-start gap-x-2 text-gray-500 text-sm"}>
                    {stats.map((stat, index) => (
                        <li key={stat} className={"flex gap-2"}>
                            {index > 0 && <span aria-hidden={"true"}>·</span>}
                            <span>{stat}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    )
}
