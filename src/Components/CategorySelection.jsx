import React from "react";

export default function CategorySelection({form, setForm, categories}) {
    return (
        <select
            className={"w-full pl-4 h-12 text-lg border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 outline-0 pl-3 appearance-none"}
            value={form.category_id}
            onChange={(event) => setForm({...form, category_id: event.target.value})}
        >
            {
                categories.isSuccess && categories.data.filter(category => category.id !== 1).map((category) => {
                    return <option key={category.id} value={category.id}>{category.category_name}</option>
                })
            }
        </select>
    )
}