import {Fragment} from 'react'
import {Dialog, DialogPanel, DialogTitle, Transition, TransitionChild} from '@headlessui/react'
import {AiOutlineCheck} from "react-icons/ai";
import {FaSkullCrossbones} from "react-icons/fa";
import Spinner from "./Spinner";

export default function Modal({
                                  open,
                                  title,
                                  body,
                                  goBackButtonText,
                                  handleGoBackButtonClick,
                                  isLoading = false,
                                  onHide,
                                  type = "info"
                              }) {

    const Mark = () => {
        switch (type) {
            case "info":
                return <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <AiOutlineCheck className="h-6 w-6 text-green-600" aria-hidden="true"/>
                </div>
            case "danger":
                return <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <FaSkullCrossbones className="h-6 w-6 text-red-600" aria-hidden="true"/>
                </div>
            default:
                return <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <AiOutlineCheck className="h-6 w-6 text-green-600" aria-hidden="true"/>
                </div>
        }
    }

    const getVariableMainButtonClass = () => {
        switch (type) {
            case "info":
                return "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
            case "danger":
                return "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600"
            default:
                return "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
        }
    }

    const MainButton = () => {
        return (
            <button
                type="button"
                className={"inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " + getVariableMainButtonClass()}
                onClick={handleGoBackButtonClick}
            >
                {
                    isLoading
                        ? <Spinner/>
                        : goBackButtonText
                }
            </button>
        )
    }

    return (
        <Transition show={open}>
            <Dialog as="div" className="relative z-10" onClose={onHide}>
                <TransitionChild>
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-out data-closed:opacity-0 data-enter:opacity-100"/>
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex h-screen items-center justify-center p-4 text-center sm:p-0">
                        <TransitionChild>
                            <DialogPanel
                                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 ease-out data-closed:opacity-0 data-closed:translate-y-4 data-closed:sm:translate-y-0 data-closed:sm:scale-95 data-enter:opacity-100 data-enter:translate-y-0 data-enter:sm:scale-100 sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                <div>
                                    {
                                        <Mark/>
                                    }
                                    <div className="mt-3 text-center sm:mt-5">
                                        <DialogTitle as="h3"
                                                      className="text-base font-semibold leading-6 text-gray-900">
                                            {title}
                                        </DialogTitle>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <MainButton/>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
