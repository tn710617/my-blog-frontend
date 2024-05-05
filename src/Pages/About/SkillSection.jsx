import Skills from "./Skills";
import {useIntl} from "react-intl";

export default function SkillSection() {
    const intl = useIntl()
    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-col justify-start"}>
                <div className={"font-bold text-3xl"}>
                    {intl.formatMessage({id: "about.skill"})}
                </div>
                <div className={"mt-3"}>
                    {intl.formatMessage({id: "about.skill_description"})}
                </div>
            </div>
            <div>
                <Skills/>
            </div>
        </div>
    )
}