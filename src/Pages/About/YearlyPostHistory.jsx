import MonthlyPostHistory from "./MonthlyPostHistory";
import DisplayOrHideButton from "../../Components/DisplayOrHideButton";
import {useState} from "react";
import {useIntl} from "react-intl";
import {v4 as uuidv4} from "uuid";

export default function YearlyPostHistory({year, yearObj}) {
    const [showSection, setShowSection] = useState(false)
    const intl = useIntl()

    return (
        <>
            <div className={"flex items-center gap-1"}>
                <div
                    className={"text-2xl font-bold"}>{year} (<span className={"text-xl text-gray-500"}>{intl.formatMessage({id: "article_count"}, {value: yearObj.article_count})}</span>)</div>
                <DisplayOrHideButton showSection={showSection} setShowSection={setShowSection}/>
            </div>
            {
                showSection &&
                <div className={"mt-3"}>
                    {
                        Object.entries(yearObj.months).map(([monthNumeric, monthObj]) => (
                            <MonthlyPostHistory monthNumeric={monthNumeric} monthObj={monthObj} key={uuidv4()}/>
                        ))
                    }
                </div>
            }
        </>
    )
}