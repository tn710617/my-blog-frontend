import SinglePostTimeline from "./SinglePostTimeline";
import {useState} from "react";
import {useIntl} from "react-intl";
import DisplayOrHideButton from "../../Components/DisplayOrHideButton";
import {v4 as uuidv4} from "uuid";

export default function MonthlyPostHistory({monthNumeric, monthObj}) {
    const [showSection, setShowSection] = useState(false)
    const intl = useIntl()
    return (
        <div className={"flex flex-col items-start ml-1"}>
            <div className={"flex items-center gap-1"}>
                <div className={"text-xl font-bold"}>{intl.formatMessage({id: monthObj.month_name})} (<span
                    className={"text-base text-gray-500"}>{intl.formatMessage({id: "article_count"}, {value: monthObj.article_count})}</span>)
                </div>
                <DisplayOrHideButton showSection={showSection} setShowSection={setShowSection}/>
            </div>
            <div className={"mt-5 ml-4"}>
                {
                    showSection &&
                    <div className={"flex flex-wrap gap-x-8 justify-start"}>
                        {
                            Object.entries(monthObj.posts).map(([key, post]) => (
                                <SinglePostTimeline key={uuidv4()} post={post}/>
                            ))
                        }
                    </div>
                }
            </div>
        </div>
    )
}