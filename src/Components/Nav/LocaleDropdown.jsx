import React, {useEffect, useMemo, useState} from 'react';
import taiwanFlag from './taiwan.png';
import enFlag from './en.png';
import {useLocaleStore} from "../../stores";
import {useLocation, useNavigate} from "react-router";
import {useRef} from "react";

const LocaleDropdown = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const locale = useLocaleStore((state) => state.locale)
    const setLocale = useLocaleStore((state) => state.setLocale)
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayLocales = useMemo(function () {
        return [
            {
                value: 'zh-TW',
                label: '繁中',
                image: taiwanFlag,
            },
            {
                value: 'en',
                label: 'EN',
                image: enFlag,
            },
        ];
    }, []);

    const getDisplayLocale = () => {
        return displayLocales.find(displayLocale => displayLocale.value === locale);
    }

    const handleLocaleChange = (displayLocale) => {
        setLocale(displayLocale.value)
        setIsOpen(false);

        if (location.pathname.startsWith("/single-post")) {
            navigate("/")
        }
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex relative text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-100 hover:from-amber-100 hover:to-orange-200 border border-amber-200 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-opacity-50"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-300 shadow-sm">
                        <img
                            src={getDisplayLocale().image}
                            alt={getDisplayLocale().label}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-sm font-medium text-amber-700 group-hover:text-amber-800 transition-colors duration-300">
                        {getDisplayLocale().label}
                    </span>
                </div>
                <div className="text-amber-600 group-hover:text-amber-700 transition-all duration-300">
                    <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-32 rounded-xl shadow-lg bg-white border border-amber-200 focus:outline-none overflow-hidden z-50"
                >
                    <div className="py-2">
                        {displayLocales.map((displayLocale) => (
                            <button
                                key={displayLocale.value}
                                onClick={() => handleLocaleChange(displayLocale)}
                                className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-200 focus:outline-none ${
                                    displayLocale.value === locale
                                        ? 'bg-gradient-to-r from-amber-100 to-orange-200 text-amber-800 font-medium'
                                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-100 hover:text-amber-700'
                                }`}
                            >
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-300 shadow-sm mr-3">
                                    <img
                                        src={displayLocale.image}
                                        alt={displayLocale.label}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="font-medium">{displayLocale.label}</span>
                                {displayLocale.value === locale && (
                                    <div className="ml-auto text-amber-600">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20,6 9,17 4,12"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocaleDropdown;
