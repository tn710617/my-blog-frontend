import {useIntl} from "react-intl";
import {useState} from "react";

export default function Introduction() {
    const intl = useIntl()
    const [showAboutIntro, setShowAboutIntro] = useState(true)
    return (
        <>
            <div className={"w-full justify-start flex items-center gap-2"}>
                <div className={"font-bold text-3xl"}>
                    {intl.formatMessage({id: "about.intro_title"})}
                </div>
                <div className={"text-sm text-gray-400 cursor-pointer"}
                     onClick={() => setShowAboutIntro((preState) => !preState)}>(
                    {
                        showAboutIntro && intl.formatMessage({id: "about.hide_section_button"})
                    }
                    {
                        !showAboutIntro && intl.formatMessage({id: "about.display_section_button"})
                    }
                )</div>
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