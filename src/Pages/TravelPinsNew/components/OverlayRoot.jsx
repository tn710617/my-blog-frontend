import React, {useEffect} from 'react';
import {MODAL_TYPES, useModalStore} from '../stores/modalStore';
import {useMapStore} from '../stores/mapStore';
import {closeDisplayPopup, openDisplayPopup} from '../utils/displayPopupController';
import {Z_INDEX} from '../utils/zIndex';
import DisplayPopup from './Popups/DisplayPopup';
import DeleteConfirmationModal from './Modals/DeleteConfirmationModal';
import PhotoModal from './Modals/PhotoModal';
import EditPinModal from './Modals/EditPinModal';
import EscConfirmModal from './Modals/EscConfirmModal';
import {disableAll, enableAll} from '../utils/mapInteractionController'

// Unified Overlay Root: single backdrop + scroll container
const OverlayRoot = () => {
    const modalStore = useModalStore();
    const hasAnyModalOpen = modalStore.hasAnyModalOpen()
    const activeModal = modalStore.activeModal;
    const modalData = modalStore.modalData;
    const closeModal = modalStore.closeModal;
    const updateModalData = modalStore.updateModalData

    const mapInstance = useMapStore((s) => s.mapInstance);

    const handleBackdropClick = () => {
        // Unify overlay click behavior (kept from previous logic)
        if ([MODAL_TYPES.PHOTO, MODAL_TYPES.DELETE].includes(activeModal) && (modalData?.pin || modalData?.pinId)) {
            closeModal();
            setTimeout(() => {
                try {
                    openDisplayPopup(modalData?.pinId || modalData?.pin?.id);
                } catch {
                }
            }, 0);
            return;
        }
        if (activeModal === MODAL_TYPES.FORM && modalData?.confirmOpen) {
            updateModalData({confirmOpen: false});
            return;
        }
        // default (includes 'display')
        closeModal();
        closeDisplayPopup();
    };

    // Scroll lock + disable map interactions while any modal is open
    useEffect(() => {
        if (!hasAnyModalOpen) return;
        const m = mapInstance;
        const prevOverflow = document.body.style.overflow;

        const lock = () => {
            document.body.style.overflow = 'hidden';
            try {
                disableAll(m);
            } catch {
            }

        }

        const unlock = () => {
            document.body.style.overflow = prevOverflow;
            try {
                enableAll(m);
            } catch {
            }
        }

        lock();

        return () => {
            unlock();
        };
    }, [hasAnyModalOpen, mapInstance]);

    if (!hasAnyModalOpen) return null;

    return (
        <div style={{position: 'fixed', inset: 0, zIndex: Z_INDEX.OVERLAY}}>
            {/* Backdrop (shared) */}
            <div
                role="presentation"
                onClick={handleBackdropClick}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.5)'
                }}
            />

            {/* Scroll container and content surface (shared) */}
            <div
                className="fixed inset-0 flex justify-center p-4 overflow-y-auto"
                onClick={handleBackdropClick}
            >
                {/* Each child enables pointer events to remain interactive */}
                {activeModal === 'display' && (
                    <div
                        className="my-4 self-start"
                        style={{zIndex: Z_INDEX.POPUP, pointerEvents: 'auto'}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DisplayPopup withinOverlay/>
                    </div>
                )}
                {activeModal === 'delete' && (
                    <div
                        className="my-4 self-start"
                        style={{zIndex: Z_INDEX.MODAL, pointerEvents: 'auto'}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DeleteConfirmationModal withinOverlay/>
                    </div>
                )}
                {activeModal === 'form' && !modalData?.confirmOpen && (
                    <div
                        className="my-4 self-start"
                        style={{zIndex: Z_INDEX.MODAL, pointerEvents: 'auto'}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EditPinModal withinOverlay/>
                    </div>
                )}
                {activeModal === 'form' && modalData?.confirmOpen && (
                    <div
                        className="my-4 self-start"
                        style={{zIndex: Z_INDEX.MODAL, pointerEvents: 'auto'}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EscConfirmModal withinOverlay/>
                    </div>
                )}
                {activeModal === 'photo' && (
                    <div
                        className="my-4 self-center w-full"
                        style={{zIndex: Z_INDEX.MODAL, pointerEvents: 'auto'}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PhotoModal withinOverlay/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverlayRoot;
