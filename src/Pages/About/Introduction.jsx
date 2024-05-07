import {useIntl} from "react-intl";
import {useState} from "react";

export default function Introduction() {
    const intl = useIntl()
    const [showAboutIntro, setShowAboutIntro] = useState(false)
    return (
        <>
            <div className={"w-full justify-start flex items-center gap-2"}>
                <div className={"font-bold text-3xl"}>
                    {intl.formatMessage({id: "about.intro_title"})}
                </div>
                <div className={"text-sm text-gray-400 cursor-pointer"}
                     onClick={() => setShowAboutIntro((preState) => !preState)}>({intl.formatMessage({id: "about.display_or_hide_button"})})
                </div>
            </div>
            {
                showAboutIntro &&
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
            }
        </>
    )
}