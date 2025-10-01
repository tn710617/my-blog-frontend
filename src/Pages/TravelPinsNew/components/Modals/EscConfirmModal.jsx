import React from 'react';
import {useIntl} from 'react-intl';
import {useModalStore, MODAL_TYPES} from '../../stores/modalStore';
import {createModalClasses} from '../../utils/modalStyles';

const EscConfirmModal = ({withinOverlay = false}) => {
    const intl = useIntl();
    const store = useModalStore();
    const activeModal = store.activeModal;
    const modalData = store.modalData;

    // Render as inline confirm when edit form is active
    if (!(activeModal === MODAL_TYPES.FORM && modalData?.confirmOpen)) return null;

    const onCancel = () => {
        // 只關閉確認層，保留編輯表單
        try {
            store.updateModalData({confirmOpen: false});
        } catch {
        }
    };
    const onConfirm = () => {
        // 關閉確認層並放棄變更：關閉表單並回到顯示視窗
        try {
            store.updateModalData({confirmOpen: false});
        } catch {
        }

        try {
            store.closeModal();
        } catch {
        }
    };

    const t = (id) => intl.formatMessage({id});

    const content = (
        <div className={createModalClasses.dialog("w-[380px]")}>
            <div className={createModalClasses.header('warning')}>
                <div className={createModalClasses.headerOverlay()}/>
                <div className={createModalClasses.headerContent()}>
                    <div className={createModalClasses.headerIcon()}>💾</div>
                    <div className={createModalClasses.headerText()}>
                        <h3 className={createModalClasses.headerTitle()}>{t('travel_pins.unsaved_modal.title')}</h3>
                        <p className={createModalClasses.headerSubtitle()}>{t('travel_pins.unsaved_modal.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className={createModalClasses.body()}>
                <div className="space-y-4">
                    <div className={createModalClasses.contentSection('info')}>
                        <div className={createModalClasses.sectionContent()}>
                            <div className={createModalClasses.sectionIcon('small')}>💡</div>
                            <div className="text-sm text-slate-700">
                                <div className="font-semibold mb-1">{t('travel_pins.unsaved_modal.question')}</div>
                                <div>{t('travel_pins.unsaved_modal.answer')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={createModalClasses.actions()}>
                    <button onClick={onCancel} className={createModalClasses.button('continue')}>
                        {t('travel_pins.unsaved_modal.continue_button')}
                    </button>
                    <button onClick={onConfirm} className={createModalClasses.button('secondary')}>
                        {t('travel_pins.unsaved_modal.discard_button')}
                    </button>
                </div>
            </div>
        </div>
    );

    if (withinOverlay) return content;

    return (
        <div className={createModalClasses.backdrop()} role="dialog" aria-modal="true">
            {content}
        </div>
    );
};

export default EscConfirmModal;
