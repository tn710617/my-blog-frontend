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

    return (
        <IntlProvider locale={locale} key={locale} messages={getMessages(locale)}>
            {children}
        </IntlProvider>
    )
}