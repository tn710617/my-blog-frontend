import {useState} from "react";
import DisplayOrHideButton from "../../Components/DisplayOrHideButton";
import {useIntl} from "react-intl";
import portfolioData from "./portfolioData.json";

export default function Portfolio() {
    const [showSection, setShowSection] = useState(false)
    const intl = useIntl()

    const getPortfolios = () => {
        if (intl.locale === "en") {
            return portfolioData.en
        } else if (intl.locale === "zh-TW") {
            return portfolioData.zh_TW
        }
    }

    const PortfolioCard = ({imageUrl, title, description, postId}) => {
        return (
            <div
                className={"flex flex-col gap-3 w-full sm:w-2/3 md:w-2/5 xl:w-1/4 border rounded-xl shadow-xl hover:cursor-pointer"}
                onClick={() => window.open(`single-post?post_id=${postId}`, '_blank')}>
                {/*Photo*/}
                <div>
                    <img src={imageUrl} alt={title}
                         className={"w-full overflow-hidden rounded-xl"}/>
                </div>
                {/*Portfolio Name*/}
                <div className={"font-bold text-2xl pl-3"}>{title}</div>
                {/*Description*/}
                <div className={"mx-3 mb-3"}>{description}</div>
            </div>
        )
    }

    return (
        <>
            <div className={"flex items-center gap-1"}>
                <div className={"text-3xl font-bold"}>{intl.formatMessage({id: "about.portfolio"})}</div>
                <DisplayOrHideButton showSection={showSection} setShowSection={setShowSection}/>
            </div>
            {
                showSection &&
                <div className={"mt-3 ml-4"}>
                    <div className={"flex flex-wrap gap-9 justify-between"}>
                        {
                            getPortfolios().map((portfolio, index) => (
                                <PortfolioCard key={index}
                                               imageUrl={portfolio.imageUrl}
                                               title={portfolio.title}
                                               description={portfolio.description}
                                               postId={portfolio.post_id}
                                />
                            ))
                        }
                    </div>
                </div>
            }
        </>
    )
}