import {useIntl} from "react-intl";
import avatar from "./logo.png"

export default function Title() {
    const intl = useIntl()
    return (
        <div className={"flex flex-col items-center gap-4"}>
            <div>
                <img className={"rounded-xl xl:w-48 xl:h-48 md:w-36 md:h-36 w-24 h-24 object-cover"} src={avatar}
                     alt={"avatar"}/>
            </div>
            <div className={"font-bold text-4xl"}>
                {intl.formatMessage({id: "about.name"})}
            </div>
            <div className={"text-2xl"}>
                {intl.formatMessage({id: "about.job_title"})}
            </div>
        </div>
    )
}