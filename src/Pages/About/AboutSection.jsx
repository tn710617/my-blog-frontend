// 「關於我」頁每一區的外框:錨點 id 給區塊導覽跳轉,scroll-mt 讓跳過來時標題不被上方的跟隨導覽蓋住。
export default function AboutSection({id, title, children}) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className={"scroll-mt-28 flex flex-col gap-4"}>
            <h2 id={`${id}-title`} className={"font-bold text-3xl"}>{title}</h2>
            {children}
        </section>
    )
}
