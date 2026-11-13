import Title from "./Title";
import Introduction from "./Introduction";
import SkillSection from "./SkillSection";
import WorkExperienceSection from "./WorkExperienceSection";
import {useEffect} from "react";
import {useCategoryStore} from "../../stores";
import PostsTimeline from "./PostsTimeline";
import Portfolio from "./Portfolio";
import SectionNav from "./SectionNav";
import BackToTop from "./BackToTop";

export default function About() {
    const setCategoryId = useCategoryStore((state) => state.setCategoryId)
    useEffect(() => {
        setCategoryId(null)
    }, [setCategoryId]);

    return (
        <>
            <div className={"m-4 flex justify-between"}>
                <div className={"lg:block hidden lg:w-1/12 xl:w-1/6"}/>
                <div
                    className={"flex flex-col w-full min-w-0 gap-10 rounded-xl px-4 sm:px-8 lg:px-12 lg:w-10/12 shadow-xl bg-gray-50 py-7"}>
                    <Title/>
                    <SectionNav/>
                    <Introduction/>
                    <WorkExperienceSection/>
                    <Portfolio/>
                    <SkillSection/>
                    <PostsTimeline/>
                </div>
                <div className={"lg:block hidden lg:w-1/12 xl:w-1/6"}/>
            </div>
            <BackToTop/>
        </>
    )
}
