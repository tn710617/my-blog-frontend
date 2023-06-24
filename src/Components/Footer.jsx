import {BsLinkedin} from "react-icons/bs";
import {BsGithub} from "react-icons/bs";

export default function Footer()
{
    return (
        <footer>
            <div className={"h-20 bg-gray-800 flex gap-1 flex-col-reverse justify-center md:flex-row items-center md:justify-between px-12 py-8"}>
                <div className={"text-gray-200 text-sm"}>
                    © Copyright 2016-{new Date().getFullYear()}. All Rights Reserved.
                </div>
                <div className={"flex gap-3 text-2xl text-gray-300"}>
                    <a href={"https://www.linkedin.com/in/ray-lee-developer/"}><BsLinkedin className={"cursor-pointer"}/></a>
                    <a href={"https://github.com/tn710617"}><BsGithub className={"cursor-pointer"}/></a>
                </div>
            </div>
        </footer>
    )

}