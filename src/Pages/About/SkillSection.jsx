import Skills from "./Skills";
import {useIntl} from "react-intl";
import {useState} from "react";

export default function SkillSection() {
    const intl = useIntl()
    const [showSkillSection, setShowSkillSection] = useState(false)

    return (
        <div className={"flex flex-col"}>
            <div className={"flex items-center gap-2"}>
                <div className={"font-bold text-3xl"}>
                    {intl.formatMessage({id: "about.skill"})}
                </div>
                <div className={"text-sm text-gray-400 cursor-pointer"}
                     onClick={() => setShowSkillSection((preState) => !preState)}>(
                    {
                        showSkillSection && intl.formatMessage({id: "about.hide_section_button"})
                    }
                    {
                        !showSkillSection && intl.formatMessage({id: "about.display_section_button"})
                    }
                )</div>

            </div>
            {
                showSkillSection &&
                <div className={"mt-2"}>
                    <div>
                        {intl.formatMessage({id: "about.skill_description"})}
                    </div>
                    <div className={"mt-3"}>
                        <Skills/>
                    </div>
                </div>
            }
        </div>
    )
}