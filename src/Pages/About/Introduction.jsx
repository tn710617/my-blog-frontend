import {useIntl} from "react-intl";

export default function Introduction() {
    const intl = useIntl()
    return (
        <>
            <div className={"w-full justify-start"}>
                <div className={"font-bold text-3xl"}>
                    {intl.formatMessage({id: "about.intro_title"})}
                </div>
            </div>
            <div>
                <ul className={"list-disc mx-4 mt-3"}>
                    {
                        Array.from({length: 8}).map((_, index) => (
                            <li key={index}><span className="font-bold">
                        {intl.formatMessage({id: `about.intro_${index + 1}_title`})}</span> - {intl.formatMessage({id: `about.intro_${index + 1}_description`})}
                            </li>
                        ))
                    }
                </ul>
            </div>
        </>
    )
}