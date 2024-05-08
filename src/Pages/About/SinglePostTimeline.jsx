export default function SinglePostTimeline({post}) {
    return (
        <div className={"flex w-full md:w-auto items-start"}>
            <div className={"border-r w-16 h-44 max-h-screen relative"}>
                <div
                    className={"rounded-full w-5 h-5 border bg-gray-400 absolute top-0 right-0 translate-x-[50%] transform-y-[-50%]"}>
                </div>
                <div
                    className={"rounded-full w-2 h-2 border text-red-500 bg-white absolute top-1.5 right-0 translate-x-[50%] transform-y-[-50%]"}>
                </div>

                <div className={"font-bold"}>
                    {post.date}
                </div>
                <div className={"font-bold text-gray-400 text-xl"}>
                    {post.month}
                </div>
            </div>
            <div className={"flex flex-col gap-1 bg-white rounded-xl w-full md:w-48 lg:w-56 xl:w-64 ml-6 p-4 border-0 shadow h-auto mb-3"}>
                <div className={"font-bold text-xl"}>
                    {post.post_title}
                </div>
                <div className={"text-sm text-gray-400"}>
                    {post.category_name}
                </div>
            </div>
        </div>
    )
}