import SURASIALogo from "./Surasia.png"
import GoodIdeasStudioLogo from "./GoodIdeaStudio.png";
import QINFRALogo from "./qinfra.png";

export function getWorkExperiencesEn() {
    return [
        {
            "work_experience_title": "Senior Web Engineer | August 2022 ~ Present",
            "work_company_name": "Surasia Integration Co., Ltd.",
            "work_company_logo": SURASIALogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>Full-stack development of NFT marketplace application: Frontend, backend, and smart contracts
                    </li>
                    <li>Blockchain cold wallet: Backend development</li>
                    <li>Blockchain payment card service: Backend development</li>
                    <li>Planning and implementing API architecture for multi-version coexistence: Providing support for
                        at least two API versions when the Mobile APP is under review for updates
                    </li>
                    <li>Planning and implementing product deployment architecture:
                        <ul className={"list-disc list-outside ml-4"}>
                            <li>Implementing HA architecture: <b>GCP LB</b> & <b>GCP Instance Group</b> & <b>Docker
                                Swarm</b></li>
                            <li>Building CI/CD pipeline to fit team operations: <b>Git
                                Push</b> --> <b>Review</b> --> <b>One-click deployment</b></li>
                            <li>Implementing scheduled health checks for various services, including but not limited
                                to <b>APP Service</b>, <b>Web Service</b>, <b>DB</b>, <b>Redis</b>, <b>Node</b>, <b>VPN
                                    Server</b></li>
                            <li>Sending notifications to <b>Email</b> & <b>Slack channel</b> when any service health
                                check fails
                            </li>
                            <li>Asynchronously streaming and centralizing every <b>request log</b> from
                                different <b>containers</b> into a <b>Log Management Center</b> for future reference
                            </li>
                            <li>Sending <b>request log</b> & <b>error log</b> to <b>Slack</b> when unexpected errors
                                occur
                            </li>
                            <li>For financial service security compliance, unifying the IP for all <b>outbound
                                requests</b> to facilitate whitelist management by the financial service
                            </li>
                        </ul>
                    </li>
                    <li>Blockchain self-hosted node</li>
                    <li>Implementing <b>VPN Server</b>, attaching <b>VPN</b> before <b>ssh connection</b> to enhance
                        security level of company projects
                    </li>
                    <li>Product passed <b>VAPT</b> testing with no threats rated Medium or above</li>
                    <li>Issue resolved:
                        <ul className={"list-disc list-outside ml-4"}>
                            <li>Implemented <b>key rotation</b> mechanism to bypass third-party service <b>API rate
                                limit</b></li>
                            <li>Product response time was too long due to using <b>CloudFlare Proxy SSL</b></li>
                            <li>Product's <b>Docker Swarm</b> architecture experienced communication failure between
                                nodes due to differing <b>GCP MTU</b></li>
                            <li>Response body was truncated when exceeding buffer length due to incorrect <b>Nginx
                                Buffer</b> permissions settings
                            </li>
                        </ul>
                    </li>
                </ul>

            )
        },
        {
            "work_experience_title": "Senior Backend Engineer | November 2018 ~ August 2022",
            "work_company_name": "Good Ideas Studio",
            "work_company_logo": GoodIdeasStudioLogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>Assist multiple companies in developing projects, including but not limited to:</li>
                    <ul className={"ml-4 list-disc out-inside list"}>
                        <li>Project development</li>
                        <li>Server management</li>
                        <li>Database management</li>
                        <li>DNS management</li>
                        <li>CI/CD building</li>
                        <li>Architecture design</li>
                        <li>Technical consultant</li>
                    </ul>
                    <li>Queue advanced application:</li>
                    <ul className={"ml-4 list-disc list-outside list"}>
                        <li>Export <span className={"font-bold"}>tens of thousands</span> of data to Excel and upload to
                            AWS S3 for download
                        </li>
                        <li>Send <span className={"font-bold"}>hundreds of thousands</span> of coupons to <span
                            className={"font-bold"}>fifty thousand</span> LINE users
                        </li>
                    </ul>
                    <li>Introduction of testing</li>
                    <li>Implementation of main third-party login</li>
                    <li>Discover and eliminate race condition problems</li>
                    <li>SQL query optimization</li>
                    <li>Scalable architecture design and implementation</li>
                </ul>
            )
        },
        {
            "work_experience_title": "Backend Engineer | April 2018 ~ November 2018",
            "work_company_name": "QINFRA",
            "work_company_logo": QINFRALogo,
            "work_experience_description": (
                <ul className={"list-disc list-outside ml-4"}>
                    <li>Optimize code, reduce costs by 70%, and reduce response time from 30 minutes to 10 seconds</li>
                    <li>Establish a log management mechanism on the machine, compress log periodically, and remove log
                        periodically
                    </li>
                    <li>Establish a machine health check mechanism and report through Slack and email</li>
                    <li>Implement Load Balancer architecture to improve service availability</li>
                    <li>Build various kind of servers according to business logic, such as SFTP Server, FTP Server,
                        WebDAV Server, and NFS Server
                    </li>
                    <li>Use GitLab Runner with PM2 to build CI/CD pipeline on existing projects</li>
                </ul>
            )
        },

    ]

}