import {useIntl} from "react-intl";
import AboutSection from "./AboutSection";
import {introClaims, resolveEvidence} from "./aboutData";

// 自我介紹:四條,每條一句話,底下附連到文章段落的證據(決策 16-1 第 2 點)。
export default function Introduction() {
    const intl = useIntl()
    return (
        <AboutSection id={"intro"} title={intl.formatMessage({id: "about.intro.section_title"})}>
            <ul className={"grid gap-4 md:grid-cols-2"}>
                {introClaims.map(claim => (
                    <li key={claim.id} aria-labelledby={`intro-${claim.id}`}
                        className={"flex flex-col gap-2 rounded-xl border p-4 bg-white shadow-lg"}>
                        <h3 id={`intro-${claim.id}`} className={"font-bold text-xl"}>
                            {intl.formatMessage({id: `about.intro.${claim.id}.title`})}
                        </h3>
                        <p>{intl.formatMessage({id: `about.intro.${claim.id}.sentence`})}</p>
                        <div className={"text-sm text-gray-400"}>{intl.formatMessage({id: "about.evidence.label"})}</div>
                        <ul className={"flex flex-col gap-1 text-sm"}>
                            {claim.evidence.map(evidence => {
                                const {href, isChineseOnly} = resolveEvidence(evidence, intl.locale)
                                return (
                                    <li key={evidence.titleId}>
                                        <a href={href} target={"_blank"} rel={"noreferrer"}
                                           className={"text-blue-600 hover:underline"}>
                                            {intl.formatMessage({id: evidence.titleId})}
                                            {isChineseOnly && ` ${intl.formatMessage({id: "about.evidence.zh_only"})}`}
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                ))}
            </ul>
        </AboutSection>
    )
}
