import qinfra from "./qinfra.png";
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
                    <li>Full-stack development of blockchain NFT trading market applications: front-end, back-end, smart
                        contracts
                    </li>
                    <li>Cold wallet product: backend development</li>
                    <li>Virtual currency card service: backend development</li>
                    <li>Plan and implement a multi-version coexistence API architecture: provide support for at least
                        two versions of the API when the Mobile APP is in updating process
                    </li>
                    <li>Plan and implement HA architecture on products</li>
                    <li>Complete the self-built blockchain node</li>
                    <li>Solve the problem of product response time being too long</li>
                    <li>Solve the communication issue among multiple nodes in Docker Swarm architecture</li>
                    <li>Detect and solve the response body too long issue</li>
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