import GoodIdeasStudioLogo from "./GoodIdeaStudio.png"
import QINFRALogo from "./qinfra.png"
import TnpLogo from "./TnpLogo.png"

export function getWorkExperiencesZhTw() {
    return [
        {
            "work_experience_title": "資深網頁工程師 | 2022 年 8 月 ~ 至今",
            "work_company_name": "台灣銘板股份有限公司",
            "work_company_logo": TnpLogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>NFT 交易市場應用全端開發：前端，後端，智能合約</li>
                    <li>區塊鏈冷錢包：後端開發</li>
                    <li>區塊鏈簽帳卡服務：後端開發</li>
                    <li>規劃並實作多版本共存 API 架構：當 Mobile APP 在送審更新時，提供至少兩個版本的 API 支援</li>
                    <li>規劃並且實作產品部署架構：
                        <ul className={"list-disc list-outside ml-4"}>
                            <li>實作 HA 架構：<b>GCP LB</b> & <b>GCP Instance Group</b> & <b>Docker Swarm</b></li>
                            <li>建置符合團隊運作 CI/CD 管道：<b>Git Push</b> --> <b>審查</b> --> <b>一鍵部署</b></li>
                            <li>針對各項服務實作固定頻率健康檢查，包含但不限於 <b>APP Service</b>，<b>Web
                                Service</b>，<b>DB</b>，<b>Redis</b>，<b>Node</b>，<b>VPN Server</b></li>
                            <li>任一服務健康檢查未通過時，發送通知到 <b>Email</b> & <b>Slack channel</b></li>
                            <li>將不同 <b>container</b> 的每個 <b>request log</b> 非同步串流集中到 <b>Log 管理中心</b>，供後續查閱
                            </li>
                            <li>非預期 error 產生時，將 <b>request log</b> & <b>error log</b> 發送到 <b>Slack</b></li>
                            <li>因應配合金融服務資安要求，將所有 <b>outbound request</b> 統一 IP，以利金融服務管理白名單
                            </li>
                        </ul>
                    </li>
                    <li>區塊鏈自建節點</li>
                    <li>實作 <b>VPN Server</b>，在 <b>ssh connection</b> 之前掛上 <b>VPN</b>，強化公司專案資安等級</li>
                    <li>產品通過 <b>VAPT</b> 檢測，無任何 Medium 以上威脅</li>
                    <li>Issue resolved：
                        <ul className={"list-disc list-outside ml-4"}>
                            <li>實作 <b>key rotation</b> 機制，突破第三方服務 <b>API rate limit</b></li>
                            <li>產品因使用 <b>CloudFlare Proxy SSL</b>，造成 Response Time 過長</li>
                            <li>產品在 <b>Docker Swarm</b> 的架構下，因 <b>GCP MTU</b> 不同，導致 Node 之間無法溝通</li>
                            <li>產品因 <b>Nginx Buffer</b> 權限設定不正確，當 Response Body 超出 Buffer 長度時，會被截斷
                            </li>
                        </ul>
                    </li>
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
                        <li>隊列發送<span className={"font-bold"}>十萬張</span>卷到<span
                            className={"font-bold"}>五萬個</span> LINE 使用者
                        </li>
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