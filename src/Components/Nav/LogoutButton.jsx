import React from "react";
import {useIntl} from "react-intl";
import {BiLogOut} from "react-icons/bi";

export default function LogoutButton({onClick, isLoading}) {
    const intl = useIntl()
    return (
        <button
            onClick={onClick}
            className={"flex text-red-400 items-center gap-2 border border-1 border-red-400 px-3 py-1 rounded-lg cursor-pointer hover:bg-red-400 hover:text-white"}>
            {
                isLoading
                    ? <BiLogOut className={"text-xl animate-spin"}/>
                    : <BiLogOut className={"text-xl"}/>
            }
            <span className={"text-sm sm:text-xl"}>{intl.formatMessage({id: "nav.logout_button"})}</span>

        </button>

    )
}