import {useIntl} from "react-intl";

export default function DisplayOrHideButton({showSection, setShowSection}) {
    const intl = useIntl()

    return (
        <div className={"text-sm text-gray-400 cursor-pointer"}
             onClick={() => setShowSection((preState) => !preState)}>(
            {
                showSection && intl.formatMessage({id: "about.hide_section_button"})
            }
            {
                !showSection && intl.formatMessage({id: "about.display_section_button"})
            }
            )
        </div>
    )
}