import {useIntl} from "react-intl";
import {getWorkExperiencesZhTw} from "./WorkExperiencesZhTw";
import {getWorkExperiencesEn} from "./WorkExperiencesEn";
import SingleWorkExperience from "./SingleWorkExperience";
import AboutSection from "./AboutSection";

export default function WorkExperienceSection() {
    const intl = useIntl()
    const workExperiences = intl.locale === "en" ? getWorkExperiencesEn() : getWorkExperiencesZhTw()

    return (
        <AboutSection id={"experience"} title={intl.formatMessage({id: "about.work_experience_title"})}>
            <div className={"flex flex-col gap-4"}>
                {workExperiences.map((workExperience, index) => (
                    <SingleWorkExperience key={index}
                                          jobTitle={workExperience.title}
                                          period={workExperience.period}
                                          companyName={workExperience.work_company_name}
                                          highlights={workExperience.highlights}
                                          details={workExperience.work_experience_description}
                                          companyLogo={workExperience.work_company_logo}
                    />
                ))}
            </div>
        </AboutSection>
    )
}
