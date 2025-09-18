import React from "react";
import {useIntl} from "react-intl";

export default function PositionDemoPage() {
  const intl = useIntl();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {intl.formatMessage({id: "demo.css-position.page_title"})}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {intl.formatMessage({id: "demo.css-position.page_subtitle"})}
          </p>
        </div>

        {/* 1. Static */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
            {intl.formatMessage({id: "demo.css-position.static_title"})}
          </h2>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">
              {intl.formatMessage({id: "demo.css-position.static_a"})}
            </div>
            <div className="bg-amber-100 border border-amber-300 p-3 mb-3 rounded font-medium text-amber-900 static">
              {intl.formatMessage({id: "demo.css-position.static_b"})}
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">
              {intl.formatMessage({id: "demo.css-position.static_c"})}
            </div>
          </div>
        </div>

        {/* 2. Relative */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
            {intl.formatMessage({id: "demo.css-position.relative_title"})}
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {intl.formatMessage({id: "demo.css-position.relative_description"})}
          </p>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">
              {intl.formatMessage({id: "demo.css-position.relative_a"})}
            </div>
            <div className="bg-amber-100 border border-amber-300 p-3 mb-3 rounded font-medium text-amber-900 relative top-10 shadow-md">
              {intl.formatMessage({id: "demo.css-position.relative_b"})}
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">
              {intl.formatMessage({id: "demo.css-position.relative_c"})}
            </div>
          </div>
        </div>

        {/* 3. Absolute */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
            {intl.formatMessage({id: "demo.css-position.absolute_title"})}
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {intl.formatMessage({id: "demo.css-position.absolute_description"})}
          </p>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg relative min-h-[140px]">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">
              {intl.formatMessage({id: "demo.css-position.absolute_a"})}
            </div>
            <div className="bg-red-100 border-2 border-red-400 p-3 rounded font-medium text-red-900 absolute top-0 left-0 shadow-lg z-10">
              {intl.formatMessage({id: "demo.css-position.absolute_b"})}
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">
              {intl.formatMessage({id: "demo.css-position.absolute_c"})}
            </div>
            <div className="mt-3 text-gray-500 text-xs sm:text-sm bg-white p-2 rounded border">
              {intl.formatMessage({id: "demo.css-position.absolute_note"})}
            </div>
          </div>
        </div>

        {/* 4. Fixed */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
            {intl.formatMessage({id: "demo.css-position.fixed_title"})}
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {intl.formatMessage({id: "demo.css-position.fixed_description"})}
          </p>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">
              {intl.formatMessage({id: "demo.css-position.fixed_a"})}
            </div>
            <div className="bg-purple-100 border-2 border-purple-400 p-2 sm:p-3 rounded font-medium text-purple-900 fixed bottom-4 left-4 z-50 shadow-xl">
              {intl.formatMessage({id: "demo.css-position.fixed_b"})}
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">
              {intl.formatMessage({id: "demo.css-position.fixed_c"})}
            </div>
          </div>
        </div>

        {/* 讓頁面夠長，觀察 sticky 行為 */}
        <div className="h-[30vh]" />

        {/* 5. Sticky */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
            {intl.formatMessage({id: "demo.css-position.sticky_title"})}
          </h2>

          {/* 5-1 視窗 sticky */}
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
            {intl.formatMessage({id: "demo.css-position.sticky_viewport_title"})}
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {intl.formatMessage({id: "demo.css-position.sticky_viewport_description"})}
          </p>
        </div>

        <div className="sticky top-0 bg-orange-100 border-2 border-orange-300 p-3 sm:p-4 z-20 shadow-lg rounded-lg mb-6">
          <div className="font-bold text-orange-900">
            {intl.formatMessage({id: "demo.css-position.sticky_viewport_bar_title"})}
          </div>
          <div className="text-orange-700 text-sm">
            {intl.formatMessage({id: "demo.css-position.sticky_viewport_bar_subtitle"})}
          </div>
        </div>

        <div className="h-[30vh]" />

        {/* 5-2 容器內 sticky */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
            {intl.formatMessage({id: "demo.css-position.sticky_container_title"})}
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {intl.formatMessage({id: "demo.css-position.sticky_container_description"})}
          </p>
          <div className="border-2 border-indigo-300 h-52 sm:h-64 overflow-auto rounded-lg bg-gray-50">
            <div className="sticky top-0 bg-indigo-100 border-b-2 border-indigo-300 p-3 sm:p-4 font-bold text-indigo-900 shadow-sm">
              {intl.formatMessage({id: "demo.css-position.sticky_container_header"})}
            </div>
            <div className="p-4 leading-relaxed text-gray-700">
              {Array.from({length: 25}, (_, i) => (
                <div key={i} className="py-1">
                  {intl.formatMessage({id: "demo.css-position.sticky_container_content"}, {number: i + 1})}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 重點總結 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-xl p-6 sm:p-8 border border-indigo-200">
          <div className="font-bold mb-4 text-lg sm:text-xl text-indigo-900">
            {intl.formatMessage({id: "demo.css-position.summary_title"})}
          </div>
          <div className="grid gap-3 text-sm sm:text-base">
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">static</code>
              <span className="text-gray-700 ml-2">
                {intl.formatMessage({id: "demo.css-position.summary_static"})}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">relative</code>
              <span className="text-gray-700 ml-2">
                {intl.formatMessage({id: "demo.css-position.summary_relative"})}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">absolute</code>
              <span className="text-gray-700 ml-2">
                {intl.formatMessage({id: "demo.css-position.summary_absolute"})}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">fixed</code>
              <span className="text-gray-700 ml-2">
                {intl.formatMessage({id: "demo.css-position.summary_fixed"})}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">sticky</code>
              <span className="text-gray-700 ml-2">
                {intl.formatMessage({id: "demo.css-position.summary_sticky"})}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm text-yellow-800 leading-relaxed">
            {intl.formatMessage({id: "demo.css-position.summary_note"})}
          </div>
        </div>

        <div className="h-[30vh]" />
      </div>
    </div>
  );
}