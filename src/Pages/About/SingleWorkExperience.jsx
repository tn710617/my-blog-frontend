import {useState} from "react";
import {useIntl} from "react-intl";

// 一段經歷:年份區間、公司、職稱與 3~4 條成果;其餘細項收在「看完整內容」(決策 16-1 第 3 點)。
export default function SingleWorkExperience({jobTitle, period, companyName, highlights, details, companyLogo}) {
    const intl = useIntl()
    const [showDetails, setShowDetails] = useState(false)

    return (
        <article className={"flex flex-col gap-3 rounded-xl border p-4 bg-white shadow-lg"}>
            <div className={"flex items-start gap-4"}>
                <img className={"w-12 h-12 md:w-20 md:h-20 object-contain rounded-xl border bg-white shrink-0"}
                     src={companyLogo} alt={companyName}/>
                <div className={"flex flex-col gap-1 min-w-0"}>
                    <div className={"text-sm text-gray-500"}>{period}</div>
                    <h3 className={"font-bold text-xl"}>{jobTitle}</h3>
                    <div className={"text-gray-400 text-sm"}>{companyName}</div>
                </div>
            </div>
            <ul className={"list-disc list-outside ml-5 flex flex-col gap-1"}>
                {highlights.map(highlight => <li key={highlight}>{highlight}</li>)}
            </ul>
            <div>
                <button type={"button"} aria-expanded={showDetails}
                        onClick={() => setShowDetails(pre => !pre)}
                        className={"text-sm text-gray-400 hover:text-gray-800"}>
                    {intl.formatMessage({id: showDetails ? "about.experience.hide_details" : "about.experience.show_details"})}
                </button>
                {showDetails && <div className={"mt-2 text-sm break-words"}>{details}</div>}
            </div>
        </article>
    )
}
