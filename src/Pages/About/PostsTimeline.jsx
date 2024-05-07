import {useState} from "react";
import DisplayOrHideButton from "../../Components/DisplayOrHideButton";
import YearlyPostHistory from "./YearlyPostHistory";
import {useIntl} from "react-intl";
import {useIndexGroupsPosts} from "../../APIs/posts";
import {v4 as uuidv4} from "uuid";


export default function PostsTimeline() {
    const [showSection, setShowSection] = useState(false)
    const intl = useIntl()
    const indexGroupedPosts = useIndexGroupsPosts({})
    console.log(indexGroupedPosts.data)

    return (
        <>
            <div className={"flex items-center gap-1"}>
                <div className={"text-3xl font-bold"}>{intl.formatMessage({id: "about.posts_history"})}</div>
                <DisplayOrHideButton showSection={showSection} setShowSection={setShowSection}/>
            </div>
            {
                showSection &&
                <div className={"mt-3 ml-4"}>
                    {
                        indexGroupedPosts.isSuccess &&
                        Object.entries(indexGroupedPosts.data).map(([year, yearObj]) => (
                            <YearlyPostHistory key={uuidv4()} year={year} yearObj={yearObj}/>
                        ))
                    }
                </div>
            }
        </>
    )
}