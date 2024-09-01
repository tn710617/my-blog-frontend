export default function SingleWorkExperience({jobTitle, companyName, workExperienceDescription, companyLogo}) {
    return (
        <div className={"flex justify-between gap-4"}>
            {/* work experience detail */}
            <div className={"flex flex-col gap-2 mt-3 md:w-3/5"}>
                {/* work experience title */}
                <div>
                    <span className={"font-bold text-xl"}>{jobTitle}</span>
                </div>
                {/* work company name */}
                <div>
                    <span className={"text-gray-400 text-sm"}>{companyName}</span>
                </div>
                {/* work experience description section */}
                <div>
                    {workExperienceDescription}
                </div>
            </div>
            <div className={"hidden md:flex items-start w-2/5"}>
                <img className={"w-full h-auto rounded-xl"} src={companyLogo} alt={"companyLogo"}/>
            </div>
        </div>
    )
}