import GitHubLinkComponent from "./GitHubLinkComponent";
import LinkedInLinkComponent from "./LinkedInLinkComponent";
import MediumLinkComponent from "./MediumLinkComponent";

export default function Footer() {
    return (
        <footer>
            <div
                className={"h-20 bg-gray-800 flex gap-1 flex-col-reverse justify-center md:flex-row items-center md:justify-between px-12 py-8"}>
                <div className={"text-gray-200 text-sm"}>
                    © Copyright 2016-{new Date().getFullYear()}. All Rights Reserved.
                </div>
                <div className={"flex gap-3 text-2xl text-gray-300"}>
                    <GitHubLinkComponent/>
                    <LinkedInLinkComponent/>
                    <MediumLinkComponent/>
                </div>
            </div>
        </footer>
    )

}