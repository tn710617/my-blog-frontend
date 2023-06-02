import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "@yaireo/tagify/dist/tagify.css";
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import {RecoilRoot} from "recoil";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {IntlProvider} from "react-intl";
import zhTW from "./locales/zh-TW.json";

const locale = navigator.language

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RecoilRoot>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter basename={process.env.PUBLIC_URL}>
                    <IntlProvider locale={locale} key={locale} messages={zhTW}>
                        <App/>
                    </IntlProvider>
                    <ReactQueryDevtools initialIsOpen={false}/>
                </BrowserRouter>
            </QueryClientProvider>
        </RecoilRoot>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();