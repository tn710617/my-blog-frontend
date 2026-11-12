import React from "react";
import {Link} from "react-router";
import {useIntl} from "react-intl";
import {MdKey} from "react-icons/md";

// 已登入時導覽列上的「Passkey」入口,通往後台 passkey 管理頁(決策 15-1 第 5 點)。
export default function PasskeysButton() {
    const intl = useIntl()
    return (
        <Link
            to={"/passkeys"}
            className="group hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 border border-amber-200 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
            <MdKey className="text-[18px] text-amber-600 group-hover:text-amber-700" aria-hidden="true"/>
            <span className="text-sm font-medium text-amber-700 group-hover:text-amber-800">
                {intl.formatMessage({id: "nav.passkeys"})}
            </span>
        </Link>
    )
}
