import React from "react";
import {useIntl} from "react-intl";

export default function IsPublicSelect({form, setForm}) {
    const intl = useIntl()
    return (
        <select
            className={"w-full pl-4 h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-0 pl-3 appearance-none"}
            value={form.is_public}
            onChange={(event) => setForm({...form, is_public: event.target.value === 'true'})}
        >
            <option value={true}>{intl.formatMessage({id: "store_post.is_public.option.public"})}</option>
            <option value={false}>{intl.formatMessage({id: "store_post.is_public.option.private"})}</option>
        </select>

    )
}