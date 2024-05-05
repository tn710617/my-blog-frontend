import {useIntl} from "react-intl";
import {getWorkExperiencesZhTw} from "./WorkExperiencesZhTw";
import {getWorkExperiencesEn} from "./WorkExperiencesEn";
import SingleWorkExperience from "./SingleWorkExperience";
import {useEffect, useState} from "react";

export default function WorkExperienceSection() {
    const intl = useIntl()
    const [workExperiences, setWorkExperiences] = useState(() => getWorkExperiencesZhTw());

    useEffect(() => {
        if (intl.locale === "en") {
            setWorkExperiences(() => getWorkExperiencesEn());
        } else if (intl.locale === "zh-TW") {
            setWorkExperiences(() => getWorkExperiencesZhTw());
        }

    }, [intl.locale]);

    return (
        <div className={"flex flex-col"}>
            {/* work experience title */}
            <div className={"font-bold text-3xl"}>
                {intl.formatMessage({id: "about.work_experience_title"})}
            </div>
            <div className={"flex flex-col gap-4"}>
                {
                    workExperiences.map((workExperience, index) => (
                        <SingleWorkExperience key={index}
                                              jobTitle={workExperience.work_experience_title}
                                              companyName={workExperience.work_company_name}
                                              workExperienceDescription={workExperience.work_experience_description}
                                              companyLogo={workExperience.work_company_logo}
                        />
                    ))
                }
            </div>

        </div>
    )
}