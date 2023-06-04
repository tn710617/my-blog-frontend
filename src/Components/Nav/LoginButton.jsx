import React from "react";
import {useIntl} from "react-intl";
import {BiLogInCircle} from "react-icons/bi";

export default function LoginButton({onClick, isLoading}) {
    const intl = useIntl()
    return (
        <button
            onClick={onClick}
            className={"flex text-emerald-400 items-center gap-2 border border-1 border-green-400 px-3 py-1 rounded-lg cursor-pointer hover:bg-green-400 hover:text-white"}>
            {
                isLoading
                    ? <BiLogInCircle className={"text-xl animate-spin"}/>
                    : <BiLogInCircle className={"text-xl"}/>

            }
            <span className={"text-lg"}>{intl.formatMessage({id: "nav.login_button"})}</span>
        </button>
    )
}