import {useEffect, useState} from "react";
import {useIntl} from "react-intl";
import {AiOutlineArrowUp} from "react-icons/ai";

// 捲過一個畫面高之後才出現的回頂端按鈕。
export default function BackToTop() {
    const intl = useIntl()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > window.innerHeight)
        onScroll()
        window.addEventListener("scroll", onScroll, {passive: true})
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    if (!visible) return null

    const label = intl.formatMessage({id: "about.back_to_top"})
    return (
        <button type={"button"}
                aria-label={label}
                title={label}
                onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                className={"fixed bottom-6 right-6 z-40 rounded-full bg-gray-800 text-white p-3 shadow-lg hover:bg-gray-600 transition-colors duration-300"}>
            <AiOutlineArrowUp/>
        </button>
    )
}
