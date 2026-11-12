import {useEffect} from "react";
import {useLocation} from "react-router";

const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "mousedown"]

// 從別頁帶段落錨點進來(/single-post?post_id=1#-某一段)時,內容載入完把那一段捲進畫面(決策 16-1 第 8 點)。
// 文章內容是非同步載入的,瀏覽器自己的錨點跳轉發生時那一段還不存在,所以要等 ready 才捲。
// 圖片與 mermaid 圖在之後才撐開版面、會把那一段往下推(冷啟動時圖片可能晚好幾秒才到):settleMs 之內版面變動就再對齊一次;
// 讀者自己動了(滾輪、觸控、按鍵、點擊)就不再搶他的捲動位置。
export default function useScrollToHash(ready, {settleMs = 10000} = {}) {
    const {hash} = useLocation()

    useEffect(() => {
        if (!ready || !hash) return

        let id = hash.slice(1)
        try {
            id = decodeURIComponent(id)
        } catch {
            // 不是合法的百分比編碼就照原字找
        }
        const target = document.getElementById(id)
        if (!target) return

        const align = () => target.scrollIntoView({block: "start"})
        align()

        if (typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver(align)
        const stop = () => {
            observer.disconnect()
            USER_SCROLL_EVENTS.forEach(event => window.removeEventListener(event, stop))
        }
        observer.observe(document.body)
        USER_SCROLL_EVENTS.forEach(event => window.addEventListener(event, stop, {passive: true}))
        const timer = setTimeout(stop, settleMs)

        return () => {
            clearTimeout(timer)
            stop()
        }
    }, [ready, hash, settleMs])
}
