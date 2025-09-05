import React from "react";
import {IntlProvider} from "react-intl";
import {useLocaleStore} from "../stores";
import zhTW from "../locales/zh-TW.json"
import en from "../locales/en.json"

const getMessages = (locale) => {
    switch (locale) {
        case "zh-TW":
            return zhTW
        case "en":
            return en
        default:
            return zhTW
    }
}

export default function SetLocale({children}) {
    const locale = useLocaleStore((state) => state.locale)

    // 移除 key={locale}，避免切換語系時整個應用樹被強制卸載/重掛
    // React-Intl 會根據 locale 與 messages 變更觸發重新渲染即可
    return (
        <IntlProvider locale={locale} messages={getMessages(locale)}>
            {children}
        </IntlProvider>
    )
}
