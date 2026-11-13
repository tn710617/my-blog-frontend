import {useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {sections} from "./aboutData";

// 跟隨捲動的區塊導覽,標出目前所在的區。點了跳到某一區時,那一區用 scroll-mt(AboutSection.jsx)留出導覽的高度,標題不被它蓋住。
export default function SectionNav() {
    const intl = useIntl()
    const [current, setCurrent] = useState(sections[0])

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return
        const observer = new IntersectionObserver((entries) => {
            const visible = entries.filter(e => e.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
            if (visible.length > 0) setCurrent(visible[0].target.id)
        }, {rootMargin: "-30% 0px -60% 0px"})
        sections.forEach(id => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    return (
        <nav aria-label={intl.formatMessage({id: "about.nav.label"})}
             className={"sticky top-0 z-40 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-2 bg-gray-50/90 backdrop-blur-sm border-b"}>
            <ul className={"flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar"}>
                {sections.map(id => (
                    <li key={id} className={"shrink-0"}>
                        <a href={`#${id}`}
                           onClick={() => setCurrent(id)}
                           aria-current={current === id ? "location" : undefined}
                           className={`block px-3 py-1 rounded-2xl text-sm font-semibold transition-colors duration-300 ${
                               current === id ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-slate-200"
                           }`}>
                            {intl.formatMessage({id: `about.nav.${id}`})}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
