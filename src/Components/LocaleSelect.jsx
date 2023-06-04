import React from "react";

export default function LocaleSelect({form, setForm}) {
    return (
        <select
            className={"w-full pl-4 h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-0 pl-3 appearance-none"}
            value={form.locale}
            onChange={(event) => setForm({...form, locale: event.target.value})}
        >
            <option value={'en'}>English</option>
            <option value={'zh-TW'}>中文</option>
        </select>

    )
}