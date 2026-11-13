import {useIntl} from "react-intl";
import portfolioData from "./portfolioData.json";
import AboutSection from "./AboutSection";

// 作品集卡片:圖、名稱、一句話介紹、技術標籤;完整介紹交給文章(決策 16-1 第 3 點)。
export default function Portfolio() {
    const intl = useIntl()
    const portfolios = intl.locale === "en" ? portfolioData.en : portfolioData.zh_TW

    return (
        <AboutSection id={"portfolio"} title={intl.formatMessage({id: "about.portfolio"})}>
            <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {portfolios.map(portfolio => (
                    <a key={portfolio.post_id}
                       href={`/single-post?post_id=${portfolio.post_id}`}
                       target={"_blank"} rel={"noreferrer"}
                       className={"flex flex-col gap-3 border rounded-xl shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-shadow duration-300"}>
                        <img src={portfolio.imageUrl} alt={portfolio.title}
                             className={"w-full aspect-video object-cover"}/>
                        <div className={"flex flex-col gap-2 px-3 pb-3 grow"}>
                            <h3 className={"font-bold text-2xl"}>{portfolio.title}</h3>
                            <p className={"grow"}>{portfolio.summary}</p>
                            <ul className={"flex flex-wrap gap-1"}>
                                {portfolio.tags.map(tag => (
                                    <li key={tag}
                                        className={"py-0.5 px-2 rounded-2xl text-xs font-semibold bg-slate-200"}>{tag}</li>
                                ))}
                            </ul>
                            <span className={"text-sm text-blue-600"}>{intl.formatMessage({id: "about.portfolio.read_article"})} →</span>
                        </div>
                    </a>
                ))}
            </div>
        </AboutSection>
    )
}
