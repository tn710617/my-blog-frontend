import SURASIALogo from "./Surasia.png"
import GoodIdeasStudioLogo from "./GoodIdeaStudio.png"
import QINFRALogo from "./qinfra.png"

export function getWorkExperiencesZhTw() {
    return [
        {
            "work_experience_title": "資深網頁工程師 | 2022 年 8 月 ~ 至今",
            "work_company_name": "書亞集成股份有限公司",
            "work_company_logo": SURASIALogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>NFT 交易市場應用全端開發：前端，後端，智能合約</li>
                    <li>區塊鏈冷錢包：後端開發</li>
                    <li>虛擬貨幣發卡服務：後端開發</li>
                    <li>規劃並實作多版本共存 API 架構：當 Mobile APP 在更新版本時，提供至少兩個版本的 API 支援</li>
                    <li>規劃並且實作產品 HA 架構</li>
                    <li>完成區塊鏈自建節點</li>
                    <li>解決產品 response time 過長的問題</li>
                    <li>解決產品在 Docker Swarm 的架構下，無法運行 multiple node issue</li>
                    <li>解決產品在 response body 過長情況下 tricky issue</li>
                </ul>
            )
        },
        {
            "work_experience_title": "資深後端工程師 | 2018 年 11 月 ~ 2022 年 8 月",
            "work_company_name": "好想工作室",
            "work_company_logo": GoodIdeasStudioLogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>協助多間公司開發專案，包含但不限於：</li>
                    <ul className={"ml-4 list-disc out-inside list"}>
                        <li>專案開發</li>
                        <li>server 管理</li>
                        <li>資料庫管理</li>
                        <li>DNS 管理</li>
                        <li>CI/CD 建置</li>
                        <li>架構規劃</li>
                        <li>技術顧問</li>
                    </ul>
                    <li>Queue 進階應用：</li>
                    <ul className={"ml-4 list-disc list-outside list"}>
                        <li>隊列匯出<span className={"font-bold"}>數萬筆</span>的資料到 Excel，並上傳到 s3 供下載</li>
                        <li>隊列發送<span className={"font-bold"}>十萬張</span>卷到<span className={"font-bold"}>五萬個</span> LINE 使用者</li>
                    </ul>
                    <li>導入測試</li>
                    <li>主流第三方登入實作</li>
                    <li>Race condition 問題發現並排除</li>
                    <li>SQL query 優化</li>
                    <li>Scalable 架構設計與實作</li>
                </ul>
            )
        },
        {
            "work_experience_title": "後端工程師 | 2018 年 4 月 ~ 2018 年 11 月",
            "work_company_name": "QINFRA",
            "work_company_logo": QINFRALogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>優化程式碼，費用降低 70%，response time 由 30 分鐘降至 10 秒</li>
                    <li>針對機器上的 log 建立管理機制，週期性壓縮，週期性移除</li>
                    <li>建立機器 health check 機制，並透過 Slack、email 回報</li>
                    <li>導入 Load Balancer 架構以提高服務可用性</li>
                    <li>因應公司需求自架各種不同的 server，例如 SFTP Server、FTP Server、WebDAV Server，以及 NFS Server</li>
                    <li>使用 GitLab Runner 搭配 PM2 建立現有專案 CI/CD 管道</li>
                </ul>
            )
        },
    ]

}