import React, {useState} from "react";
import dayjs from "dayjs";
import {useIntl} from "react-intl";
import toast from "react-hot-toast";
import {MdKey} from "react-icons/md";
import Modal from "../../Components/Modal";
import Spinner from "../../Components/Spinner";
import {useDeletePasskey, usePasskeys, useRegisterPasskey, useRenamePasskey} from "../../APIs/passkeys";

// 後台 passkey 管理頁(決策 15-1 第 1、5 點):列出、新增、改名、刪除;
// 刪「這次登入所用的那把」或「最後一把」前再確認一次。
const formatTime = (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : null

export default function Passkeys() {
    const intl = useIntl()
    const passkeys = usePasskeys()
    const registerPasskey = useRegisterPasskey()
    const renamePasskey = useRenamePasskey()
    const deletePasskey = useDeletePasskey()
    const [editing, setEditing] = useState(null)
    const [pendingDelete, setPendingDelete] = useState(null)

    const list = passkeys.data ?? []

    const handleAdd = async () => {
        try {
            await registerPasskey.mutateAsync()
        } catch (e) {
            // useRegisterPasskey 已經處理提示
        }
    }

    const handleRename = async (event) => {
        event.preventDefault()
        const name = editing.name.trim()
        if (!name) {
            return
        }
        try {
            await renamePasskey.mutateAsync({id: editing.id, name})
            toast.success(intl.formatMessage({id: 'toast.passkey.renamed'}))
            setEditing(null)
        } catch (e) {
            toast.error(intl.formatMessage({id: 'toast.passkey.action_failed'}))
        }
    }

    const reallyDelete = async (passkey) => {
        try {
            await deletePasskey.mutateAsync(passkey.id)
            toast.success(intl.formatMessage({id: 'toast.passkey.deleted'}))
        } catch (e) {
            toast.error(intl.formatMessage({id: 'toast.passkey.action_failed'}))
        } finally {
            setPendingDelete(null)
        }
    }

    const handleDelete = (passkey) => {
        if (passkey.is_current || list.length === 1) {
            setPendingDelete(passkey)
            return
        }
        reallyDelete(passkey)
    }

    const confirmMessage = pendingDelete?.is_current
        ? intl.formatMessage({id: 'passkeys.confirm_delete.current'})
        : intl.formatMessage({id: 'passkeys.confirm_delete.last'})

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-4 border-b-2 border-black pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <MdKey className="text-2xl text-emerald-600" aria-hidden="true"/>
                        <h1 className="text-xl font-semibold">{intl.formatMessage({id: 'passkeys.title'})}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={registerPasskey.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-gray-100 transition-colors duration-500 hover:bg-blue-500 disabled:opacity-70"
                    >
                        {registerPasskey.isPending ? <Spinner/> : intl.formatMessage({id: 'passkeys.add_button'})}
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-600">{intl.formatMessage({id: 'passkeys.description'})}</p>

                {passkeys.isLoading && <p className="mt-6 text-gray-500">{intl.formatMessage({id: 'passkeys.loading'})}</p>}
                {passkeys.isError && <p className="mt-6 text-red-600">{intl.formatMessage({id: 'passkeys.load_failed'})}</p>}
                {passkeys.isSuccess && list.length === 0 &&
                    <p className="mt-6 rounded-lg bg-gray-50 p-4 text-center text-gray-500">{intl.formatMessage({id: 'passkeys.empty'})}</p>}

                {list.length > 0 &&
                    <ul className="mt-6 divide-y divide-gray-100">
                        {list.map((passkey) => (
                            <li key={passkey.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    {editing?.id === passkey.id
                                        ? <form onSubmit={handleRename} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <label className="sr-only" htmlFor={`passkey-name-${passkey.id}`}>
                                                {intl.formatMessage({id: 'passkeys.name_label'})}
                                            </label>
                                            <input
                                                id={`passkey-name-${passkey.id}`}
                                                autoFocus
                                                maxLength={255}
                                                value={editing.name}
                                                onChange={(e) => setEditing({...editing, name: e.target.value})}
                                                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none sm:max-w-xs"
                                            />
                                            <div className="flex gap-2">
                                                <button type="submit" disabled={renamePasskey.isPending}
                                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                                                    {intl.formatMessage({id: 'passkeys.save_button'})}
                                                </button>
                                                <button type="button" onClick={() => setEditing(null)}
                                                        className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                                                    {intl.formatMessage({id: 'passkeys.cancel_button'})}
                                                </button>
                                            </div>
                                        </form>
                                        : <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-gray-900 break-all">{passkey.name}</span>
                                            {passkey.is_current &&
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    {intl.formatMessage({id: 'passkeys.current_badge'})}
                                                </span>}
                                        </div>}
                                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-xs text-gray-500">
                                        <dt>{intl.formatMessage({id: 'passkeys.column.created_at'})}</dt>
                                        <dd>{formatTime(passkey.created_at)}</dd>
                                        <dt>{intl.formatMessage({id: 'passkeys.column.last_used_at'})}</dt>
                                        <dd>{formatTime(passkey.last_used_at) ?? intl.formatMessage({id: 'passkeys.never_used'})}</dd>
                                    </dl>
                                </div>
                                {editing?.id !== passkey.id &&
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setEditing({id: passkey.id, name: passkey.name})}
                                                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                                            {intl.formatMessage({id: 'passkeys.rename_button'})}
                                        </button>
                                        <button type="button" onClick={() => handleDelete(passkey)} disabled={deletePasskey.isPending}
                                                className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100">
                                            {intl.formatMessage({id: 'passkeys.delete_button'})}
                                        </button>
                                    </div>}
                            </li>
                        ))}
                    </ul>}
            </div>

            <Modal
                open={pendingDelete !== null}
                type="danger"
                title={intl.formatMessage({id: 'passkeys.confirm_delete.title'})}
                body={confirmMessage}
                goBackButtonText={intl.formatMessage({id: 'passkeys.confirm_delete.confirm_button'})}
                handleGoBackButtonClick={() => reallyDelete(pendingDelete)}
                isLoading={deletePasskey.isPending}
                secondaryButtonText={intl.formatMessage({id: 'passkeys.cancel_button'})}
                onSecondaryClick={() => setPendingDelete(null)}
                onHide={() => setPendingDelete(null)}
            />
        </div>
    )
}
