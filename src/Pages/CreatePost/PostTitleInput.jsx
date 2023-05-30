import React from "react";

export default function PostTitleInput({form, setForm, isValid, setIsValid}) {
    return (
        <input
            required={true}
            className={"outline-0 w-full h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4 " + (isValid ? "" : "border-red-300")}
            placeholder={"文章標題"}
            value={form.post_title}
            onChange={(event) => {
                setForm({...form, post_title: event.target.value})
                setIsValid(true)
            }}
        />
    )
}