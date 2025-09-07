import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useModalStore} from '../../stores/modalStore';
import {useMapStore} from '../../stores/mapStore';
import {Z_INDEX} from '../../utils/zIndex';
import {markdownToHtml} from '../../utils/markdownUtils';
import {copyPinUrlToClipboard} from '../../utils/urlUtils';
import {usePinFromCache} from '../../hooks/useTravelPinsApi';
import {createModalClasses} from '../../utils/modalStyles';
import {useAuthStore} from '../../../../stores';

const DisplayPopup = ({withinOverlay = false}) => {
    const intl = useIntl();
    const activeModal = useModalStore((s) => s.activeModal);
    const modalData = useModalStore((s) => s.modalData);
    const openModal = useModalStore((s) => s.openModal);
    const closeModal = useModalStore((s) => s.closeModal);
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState('');

    const pinId = modalData?.pinId || modalData?.pin?.id;
    const latestPin = usePinFromCache(pinId);
    const pin = latestPin || modalData?.pin;
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const mapInstance = useMapStore((s) => s.mapInstance);
    
    if (activeModal !== 'display' || !pinId || !pin) return null;

    const t = (id) => intl.formatMessage({id});
    const formatDate = (date) => intl.formatDate(new Date(date));

    const onClose = () => closeModal();
    
    const onFlyTo = () => {
        if (!mapInstance || !pin.coordinates) return;
        
        // 直接使用 pin.coordinates，與深連結功能一致
        mapInstance.flyTo({
            center: pin.coordinates, // pin.coordinates 已經是 Mapbox 格式 [lng, lat]
            zoom: 15,
            duration: 2000
        });
    };
    
    const onCopy = async () => {
        setCopyError('');
        const res = await copyPinUrlToClipboard(pin.id);
        if (res?.success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } else {
            setCopyError(res?.error || '');
        }
    };
    
    const onEdit = () => {
        closeModal();
        openModal('form', {pin});
    };
    
    const onDelete = () => {
        closeModal();
        openModal('delete', {pin});
    };
    
    const onPhoto = () => {
        if (pin.photo_url) {
            openModal('photo', {url: pin.photo_url, title: pin.title, pin, pinId: pin.id});
        }
    };

    const content = (
        <div className={createModalClasses.dialog()}>
            <header className={createModalClasses.header('primary')}>
                <div className={createModalClasses.headerOverlay()}/>
                <div className={createModalClasses.headerContent()}>
                    <div className={createModalClasses.headerText()}>
                        <h3 className={createModalClasses.headerTitle()}>{pin.title}</h3>
                        {pin.visited_at && (
                            <p className="text-sm opacity-90 mt-2 font-normal">📍 {formatDate(pin.visited_at)}</p>
                        )}
                    </div>
                    <button
                        className="flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg border-none cursor-pointer flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                        aria-label="Close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </header>

            <div className={createModalClasses.body()}>
                {pin.note && (
                    <section className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                            <span className="text-base">📝</span>
                            {t('travel_pins.popup.travel_notes')}
                        </h4>
                        <div
                            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4">
                            <div className="text-sm text-slate-700 leading-relaxed max-w-none"
                                 dangerouslySetInnerHTML={{__html: markdownToHtml(pin.note)}}/>
                        </div>
                    </section>
                )}

                {pin.photo_url && (
                    <section className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                            <span className="text-base">📷</span>
                            {t('travel_pins.popup.photo')}
                        </h4>
                        <div className="relative">
                            <button
                                className="w-full border-none bg-none p-0 cursor-pointer rounded-xl overflow-hidden relative block"
                                aria-label="View photo" onClick={onPhoto}>
                                <img src={pin.photo_url} alt={pin.title}
                                     className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                                     loading="lazy"/>
                                <div
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 text-white">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="M21 21l-4.35-4.35"></path>
                                        <circle cx="11" cy="11" r="3"></circle>
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </section>
                )}

                <footer className="space-y-3 pt-4">
                    {/* 第一排：無需登入的功能 */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onFlyTo}
                            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {t('travel_pins.popup.fly_to')}
                        </button>
                        
                        <button 
                            onClick={onCopy}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {copied ? (
                                    <polyline points="20,6 9,17 4,12"/>
                                ) : (
                                    <>
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                    </>
                                )}
                            </svg>
                            {copied ? t('travel_pins.popup.copied') : t('travel_pins.popup.copy_link')}
                        </button>
                    </div>

                    {copyError && (
                        <div className="text-red-600 text-xs text-center">{copyError}</div>
                    )}

                    {/* 第二排：需要登入的功能 */}
                    {isLoggedIn && (
                        <div className="flex gap-3">
                            <button 
                                onClick={onEdit}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                                {t('travel_pins.popup.edit_button')}
                            </button>
                            
                            <button 
                                onClick={onDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2V6"/>
                                </svg>
                                {t('travel_pins.popup.delete_button')}
                            </button>
                        </div>
                    )}
                </footer>
            </div>

        </div>
    );

    if (withinOverlay) return content;

    // Standalone fallback (prefer OverlayRoot in normal flow)
    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 flex justify-center p-4 overflow-y-auto"
            style={{zIndex: Z_INDEX.POPUP, pointerEvents: 'auto'}}
        >
            <div className="my-4 self-start">
                {content}
            </div>
        </div>
    );
};

export default DisplayPopup;
