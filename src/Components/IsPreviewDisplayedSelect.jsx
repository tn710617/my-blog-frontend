import React from "react";
import {useIntl} from "react-intl";

export default function IsPreviewDisplayedSelect({form, setForm, isEditMode = false}) {
    const intl = useIntl()
    const showOptionKey = isEditMode ? "edit_post.is_preview_displayed.option.show" : "store_post.is_preview_displayed.option.show"
    const hideOptionKey = isEditMode ? "edit_post.is_preview_displayed.option.hide" : "store_post.is_preview_displayed.option.hide"

    return (
        <select
            className={"w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-0 pl-3 appearance-none"}
            value={form.is_preview_displayed}
            onChange={(event) => setForm({...form, is_preview_displayed: event.target.value === 'true'})}
        >
            <option value={true}>
                {intl.formatMessage({id: showOptionKey})}
            </option>
            <option value={false}>
                {intl.formatMessage({id: hideOptionKey})}
            </option>
        </select>
    )
}