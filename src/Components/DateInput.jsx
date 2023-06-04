import React from "react";

export default function DateInput({form, setForm}) {
    return (
        <input
            type={"datetime-local"}
            required={true}
            className={"outline-0 h-12 w-full text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4"}
            value={form.created_at}
            onChange={(event) => {
                setForm({...form, created_at: event.target.value})
            }}
        />
    )
}