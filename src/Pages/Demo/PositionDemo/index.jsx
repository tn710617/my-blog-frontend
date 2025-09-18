import React from "react";

export default function PositionDemoPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">CSS Position 屬性示範</h1>
          <p className="text-gray-600 text-sm sm:text-base">透過實際範例了解 static、relative、absolute、fixed、sticky 的差異</p>
        </div>

        {/* 1. Static */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">1. Static (預設)</h2>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">A (static)</div>
            <div className="bg-amber-100 border border-amber-300 p-3 mb-3 rounded font-medium text-amber-900 static">
              B (static; top 屬性無效)
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">C (static)</div>
          </div>
        </div>

        {/* 2. Relative */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">2. Relative (佔位不變，視覺位移)</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">B 向下移 40px，但原本的佔位空間仍保留 → 可能會覆蓋到 C</p>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">A (static)</div>
            <div className="bg-amber-100 border border-amber-300 p-3 mb-3 rounded font-medium text-amber-900 relative top-10 shadow-md">
              B (relative; top:40px)
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">C (static)</div>
          </div>
        </div>

        {/* 3. Absolute */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">3. Absolute (脫離文件流)</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">B 脫離文件流，定位在父容器左上角 → C 會補位到 B 的原位置</p>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg relative min-h-[140px]">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">A (static)</div>
            <div className="bg-red-100 border-2 border-red-400 p-3 rounded font-medium text-red-900 absolute top-0 left-0 shadow-lg z-10">
              B (absolute; top:0; left:0)
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">C (static) - 補位到 B 原本位置</div>
            <div className="mt-3 text-gray-500 text-xs sm:text-sm bg-white p-2 rounded border">
              💡 父容器設為 <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">position: relative</code>，讓 B 以此容器為定位參考
            </div>
          </div>
        </div>

        {/* 4. Fixed */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">4. Fixed (固定在視窗)</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">B 固定在視窗左下角，不會隨頁面捲動而移動</p>
          <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
            <div className="bg-blue-100 border border-blue-300 p-3 mb-3 rounded font-medium text-blue-900">A (static)</div>
            <div className="bg-purple-100 border-2 border-purple-400 p-2 sm:p-3 rounded font-medium text-purple-900 fixed bottom-4 left-4 z-50 shadow-xl">
              B (fixed; bottom:16px; left:16px)
            </div>
            <div className="bg-emerald-100 border border-emerald-300 p-3 rounded font-medium text-emerald-900">C (static)</div>
          </div>
        </div>

        {/* 讓頁面夠長，觀察 sticky 行為 */}
        <div className="h-[30vh]" />

        {/* 5. Sticky */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">5. Sticky (條件式黏附)</h2>

          {/* 5-1 視窗 sticky */}
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">5-1 視窗級 sticky</h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            下方橘色列使用 <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">position: sticky; top: 0</code>，當你往下捲動碰到視窗頂部時會黏住
          </p>
        </div>

        <div className="sticky top-0 bg-orange-100 border-2 border-orange-300 p-3 sm:p-4 z-20 shadow-lg rounded-lg mb-6">
          <div className="font-bold text-orange-900">🔖 我是頁面級 sticky bar (top:0)</div>
          <div className="text-orange-700 text-sm">捲動頁面時我會黏在視窗頂部</div>
        </div>

        <div className="h-[30vh]" />

        {/* 5-2 容器內 sticky */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">5-2 容器內 sticky</h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            下方容器可捲動，內部標題使用 <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">sticky</code>，只在容器內黏住，不會超出容器範圍
          </p>
          <div className="border-2 border-indigo-300 h-52 sm:h-64 overflow-auto rounded-lg bg-gray-50">
            <div className="sticky top-0 bg-indigo-100 border-b-2 border-indigo-300 p-3 sm:p-4 font-bold text-indigo-900 shadow-sm">
              📌 我是容器內 sticky header (top:0)
            </div>
            <div className="p-4 leading-relaxed text-gray-700">
              {Array.from({length: 25}, (_, i) => (
                <div key={i} className="py-1">內容行 {i + 1} - 這是一些示範內容</div>
              ))}
            </div>
          </div>
        </div>

        {/* 重點總結 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-xl p-6 sm:p-8 border border-indigo-200">
          <div className="font-bold mb-4 text-lg sm:text-xl text-indigo-900">📚 重點總結</div>
          <div className="grid gap-3 text-sm sm:text-base">
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">static</code>
              <span className="text-gray-700 ml-2">預設排版流，不能使用 top/left/right/bottom</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">relative</code>
              <span className="text-gray-700 ml-2">保留原佔位，視覺上偏移（可能覆蓋其他元素）</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">absolute</code>
              <span className="text-gray-700 ml-2">脫離文件流，相對最近的非 static 祖先定位</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">fixed</code>
              <span className="text-gray-700 ml-2">脫離文件流，相對視窗定位，不隨捲動移動</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100">
              <code className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs sm:text-sm font-mono">sticky</code>
              <span className="text-gray-700 ml-2">在容器內先正常流動，達門檻後黏住邊界</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm text-yellow-800 leading-relaxed">
            💡 <strong>重要提醒：</strong>sticky 需要設定門檻值（如 <code className="bg-yellow-200 px-1 rounded">top: 0</code>），且只在最近的可捲動容器內生效。
            若父元素有 <code className="bg-yellow-200 px-1 rounded">overflow: hidden</code> 或 <code className="bg-yellow-200 px-1 rounded">transform</code> 屬性，可能會影響 sticky 行為。
          </div>
        </div>

        <div className="h-[30vh]" />
      </div>
    </div>
  );
}