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
                className="flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
                  <span className="flex items-center">
                    <img
                        src={getDisplayLocale().image}
                        alt={getDisplayLocale().label}
                        className="w-5 h-5 mr-2"
                    />
                      {getDisplayLocale().label}
                  </span>
                <svg
                    className="-mr-1 ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.915l3.71-3.685a.75.75 0 111.08 1.04l-4.25 4.222a.75.75 0 01-1.08 0l-4.25-4.222a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-10 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                    <div className="py-1">
                        {displayLocales.map((displayLocale) => (
                            <button
                                key={displayLocale.value}
                                onClick={() => handleLocaleChange(displayLocale)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                            >
                                <img
                                    src={displayLocale.image}
                                    alt={displayLocale.label}
                                    className="w-5 h-5 mr-2"
                                />
                                {displayLocale.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocaleDropdown;
