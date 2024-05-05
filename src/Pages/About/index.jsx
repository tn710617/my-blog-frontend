import Title from "./Title";
import Introduction from "./Introduction";
import SkillSection from "./SkillSection";
import WorkExperienceSection from "./WorkExperienceSection";
import {useEffect} from "react";
import categoryAtom from "../../States/category";
import {useRecoilState} from "recoil";

export default function About() {
    const [, setCategory] = useRecoilState(categoryAtom)
    useEffect(() => {
        setCategory(null)
    }, []);

    return (
        <div className={"m-4 flex justify-between"}>
            <div className={"lg:block hidden lg:w-1/12 xl:w-1/6"}/>
            <div
                className={"flex flex-col gap-8 rounded-xl px-12 lg:w-10/12 shadow-xl bg-gray-50 py-7"}>
                <div>
                    <Title/>
                </div>
                <div>
                    <Introduction/>
                </div>
                <div>
                    <SkillSection/>
                </div>
                <div>
                    <WorkExperienceSection/>
                </div>

            </div>
            <div className={"lg:block hidden lg:w-1/12 xl:w-1/6"}/>
        </div>
    )
}