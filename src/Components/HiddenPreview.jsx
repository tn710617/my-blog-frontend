import React from "react";
import {useIntl} from "react-intl";
import {HiEyeSlash} from "react-icons/hi2";

export default function HiddenPreview() {
    const intl = useIntl()

    return (
        <div className={"flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-gray-200"}>
            <HiEyeSlash className={"text-4xl text-gray-400 mb-3"}/>
            <h3 className={"font-semibold text-lg text-gray-700 mb-2"}>
                {intl.formatMessage({id: "posts.hidden_preview.title"})}
            </h3>
            <p className={"text-gray-500 text-center text-sm"}>
                {intl.formatMessage({id: "posts.hidden_preview.description"})}
            </p>
        </div>
    )
}