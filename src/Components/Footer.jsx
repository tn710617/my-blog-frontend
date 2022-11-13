import {BsLinkedin} from "react-icons/bs";
import {BsGithub} from "react-icons/bs";

export default function Footer()
{
    return (
        <footer>
            <div className={"h-20 bg-gray-800 flex gap-1 flex-col-reverse justify-center md:flex-row items-center md:justify-between px-12 py-8"}>
                <div className={"text-gray-200 text-sm"}>
                    © Copyright 2020-2022. All Rights Reserved.
                </div>
                <div className={"flex gap-3 text-2xl text-gray-300"}>
                    <BsLinkedin className={"cursor-pointer"}/>
                    <BsGithub className={"cursor-pointer"}/>
                </div>
            </div>
        </footer>
    )

}