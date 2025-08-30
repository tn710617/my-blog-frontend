
# 目標

打造「可旋轉 3D 地球」來紀錄旅行足跡：
- 在地球上放 **圖釘（Pin）**，每個 Pin 包含：標題、內文留言、相關連結、照片、造訪日期。
- 點擊圖釘可打開表單（新增/編輯），可上傳多張照片。
- 之後可擴充：分享/隱私權、地點搜尋、自動帶入 EXIF GPS、行程時間線等。

建議路線：**Mapbox GL JS（Globe 模式） + React（前端） + Laravel（API & 檔案簽名上傳） + S3/Cloud Storage（圖片）**。

---

## 系統設計速覽

**前端（React）**
- 使用 `mapbox-gl@^2.9+` 的 `projection: 'globe'` 顯示 3D 地球。
- Marker：使用 Mapbox `Marker`（HTML marker），點擊開啟自訂表單（React Portal/Modal）。
- 照片上傳：先向 Laravel 要 **預簽名 URL**（或表單資料），前端直接 PUT/POST 到 S3，成功後把檔案 URL 回填到 Pin 表單再送 API 建立 Pin。
- 狀態管理：輕量先用 React state；日後可改用 Zustand/Redux。

**後端（Laravel）**
- 資料表：`pins`、`pin_photos`。
- API：
  - `GET /api/pins?bbox=...`（地圖視角載入）、`GET /api/pins/{id}`
  - `POST /api/pins`、`PUT /api/pins/{id}`、`DELETE /api/pins/{id}`
  - `POST /api/uploads/presign` 取得圖片預簽名資訊
- 檔案：S3（或 Cloudflare R2、GCS），建議圖片處理（壓縮/縮圖/EXIF 清理）用 **上傳端處理** 或 **後台 Job**。

**權限/安全**
- CSRF（同網域）或用 Bearer Token。
- 內容安全：留言/連結做 XSS 清理；連結白名單。
- 照片大小與類型限制（MIME/副檔名）。
- 速率限制（以 IP/使用者），避免暴力上傳。

---

## 資料庫 Schema（Laravel Migration 草稿）

```php
// database/migrations/2025_08_30_000000_create_pins_table.php
Schema::create('pins', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('note')->nullable(); // 留言
    $table->json('links')->nullable(); // 相關連結陣列
    $table->decimal('lat', 10, 7); // 緯度
    $table->decimal('lng', 10, 7); // 經度
    $table->date('visited_at')->nullable();
    $table->enum('visibility', ['private','friends','public'])->default('private');
    $table->timestamps();
    $table->index(['lat','lng']);
});

Schema::create('pin_photos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('pin_id')->constrained()->cascadeOnDelete();
    $table->string('url'); // S3 直連 URL（或相對路徑）
    $table->string('caption')->nullable();
    $table->unsignedSmallInteger('order')->default(0);
    $table->timestamps();
});
```

**Model 範例**
```php
// app/Models/Pin.php
class Pin extends Model
{
    protected $fillable = ['title','note','links','lat','lng','visited_at','visibility'];
    protected $casts = [
        'links' => 'array',
        'visited_at' => 'date',
    ];

    public function photos() { return $this->hasMany(PinPhoto::class); }
}

// app/Models/PinPhoto.php
class PinPhoto extends Model
{
    protected $fillable = ['url','caption','order'];
    public function pin() { return $this->belongsTo(Pin::class); }
}
```

---

## API 介面（簡化版）

```http
GET /api/pins?bbox=minLng,minLat,maxLng,maxLat
  -> 200 [{ id, title, lat, lng, thumbnailUrl, visited_at }]

GET /api/pins/{id}
  -> 200 { id, title, note, links:[], lat, lng, visited_at, visibility, photos:[{url, caption}] }

POST /api/pins
  body: {
    title: string,
    note?: string,
    links?: string[],
    lat: number,
    lng: number,
    visited_at?: YYYY-MM-DD,
    visibility?: 'private'|'friends'|'public',
    photos?: { url: string, caption?: string }[]
  }
  -> 201 { id, ... }

PUT /api/pins/{id}
DELETE /api/pins/{id}

POST /api/uploads/presign
  body: { filename: string, contentType: string }
  -> 200 { url: string, fields?: object } // S3 pre-signed（POST 或 PUT）
```

**Controller 範例（建立 Pin）**
```php
public function store(StorePinRequest $request)
{
    $pin = $request->user()->pins()->create($request->validated());

    if ($photos = $request->input('photos')) {
        foreach ($photos as $i => $p) {
            $pin->photos()->create([
                'url' => $p['url'],
                'caption' => $p['caption'] ?? null,
                'order' => $i,
            ]);
        }
    }

    return response()->json($pin->load('photos'), 201);
}
```

**驗證（FormRequest）**
```php
public function rules()
{
    return [
        'title' => ['required','string','max:120'],
        'note' => ['nullable','string','max:5000'],
        'links' => ['nullable','array','max:10'],
        'links.*' => ['url','max:500'],
        'lat' => ['required','numeric','between:-90,90'],
        'lng' => ['required','numeric','between:-180,180'],
        'visited_at' => ['nullable','date'],
        'visibility' => ['in:private,friends,public'],
        'photos' => ['nullable','array','max:20'],
        'photos.*.url' => ['required','string','max:2048'],
        'photos.*.caption' => ['nullable','string','max:200'],
    ];
}
```

---

## 檔案上傳：預簽名 URL（Laravel）

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function() {
    Route::post('/uploads/presign', [UploadController::class, 'presign']);
});
```

```php
// app/Http/Controllers/UploadController.php
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function presign(Request $request)
    {
        $data = $request->validate([
            'filename' => ['required','string','max:200'],
            'contentType' => ['required','string','max:100'],
        ]);

        $key = 'pins/'.auth()->id().'/'.now()->format('Y/m/d/').Str::uuid()."-".basename($data['filename']);

        // 選 1：Pre-signed PUT URL
        $client = Storage::disk('s3')->getAdapter()->getClient();
        $bucket = config('filesystems.disks.s3.bucket');
        $cmd = $client->getCommand('PutObject', [
            'Bucket' => $bucket,
            'Key' => $key,
            'ContentType' => $data['contentType'],
            'ACL' => 'public-read',
        ]);
        $requestSigned = $client->createPresignedRequest($cmd, '+5 minutes');
        $url = (string) $requestSigned->getUri();

        return [
            'url' => $url, // 直接對這個 URL 做 PUT
            'publicUrl' => Storage::disk('s3')->url($key),
        ];

        // 選 2（可替代）：S3 POST 表單簽名（含 fields）
    }
}
```

---

## React：Mapbox 3D 地球 + Pin 表單（最小化樣板）

> 需準備：`VITE_MAPBOX_TOKEN`，`npm i mapbox-gl`

```tsx
// src/GlobePins.tsx
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

type Pin = {
  id?: number;
  title: string;
  note?: string;
  links?: string[];
  lat: number;
  lng: number;
  visited_at?: string; // YYYY-MM-DD
  photos?: { url: string; caption?: string }[];
};

export default function GlobePins() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<Pin | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      center: [121.5654, 25.0330], // 台北
      zoom: 1.6,
    });

    mapRef.current = map;

    map.on('style.load', () => {
      map.setFog({}); // 讓地球更立體
    });

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat.wrap();
      setDraft({ title: '', lat, lng, links: [], photos: [] });
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    // 初始載入 pins（可依目前視窗 bbox 取資料）
    // fetch(`/api/pins?bbox=...`).then(...)
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {draft && (
        <div className="absolute left-4 bottom-4 bg-white/95 shadow-xl rounded-xl p-4 w-[380px] max-w-[90vw]">
          <h3 className="font-semibold mb-2">新增足跡</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            // 1) 先確保所有檔案已上傳，取得 publicUrl
            // 2) 呼叫 POST /api/pins 建立
            const res = await fetch('/api/pins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(draft),
            });
            if (res.ok) setDraft(null);
          }}>
            <input
              required
              placeholder="標題"
              className="border rounded w-full px-3 py-2 mb-2"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <textarea
              placeholder="留言（可選）"
              className="border rounded w-full px-3 py-2 mb-2"
              value={draft.note || ''}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
            <input
              type="date"
              className="border rounded w-full px-3 py-2 mb-2"
              value={draft.visited_at || ''}
              onChange={(e) => setDraft({ ...draft, visited_at: e.target.value })}
            />
            {/* Links 簡易輸入 */}
            <input
              placeholder="相關連結（以逗號分隔）"
              className="border rounded w-full px-3 py-2 mb-2"
              onBlur={(e) => {
                const arr = e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);
                setDraft({ ...draft, links: arr });
              }}
            />

            {/* 照片上傳：先 presign，再 PUT，上傳完成將 publicUrl push 進 photos */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                const uploaded: { url: string }[] = [];

                for (const file of files) {
                  const presign = await fetch('/api/uploads/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, contentType: file.type })
                  }).then(r => r.json());

                  await fetch(presign.url, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                  });

                  uploaded.push({ url: presign.publicUrl });
                }
                setDraft({ ...draft, photos: [...(draft.photos || []), ...uploaded] });
              }}
              className="mb-2"
            />

            {/* 座標展示 */}
            <div className="text-sm text-gray-600 mb-3">座標：{draft.lng.toFixed(5)}, {draft.lat.toFixed(5)}</div>

            <div className="flex gap-2">
              <button type="button" className="px-3 py-2 rounded bg-gray-200" onClick={() => setDraft(null)}>取消</button>
              <button type="submit" className="px-3 py-2 rounded bg-black text-white">儲存</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
```

**在地圖上渲染現有 Pins（Marker + Popup）**
- 實務上可將 `pins` 存 state，並在 `useEffect` 迴圈中為每筆 pin 建立 `new mapboxgl.Marker(...)` 與 `new mapboxgl.Popup(...)`，或使用 React Portal 自訂彈層。
- 若點很多，建議切換為 `GeoJSON source + symbol layer`，或在 2D 視角使用 cluster。

---

## 進階建議

- **EXIF 解析**：前端讀照片 EXIF（GPS/日期），自動填座標 & 造訪日期；若無 GPS，可用地名搜尋（Mapbox Geocoding / Nominatim）轉座標。
- **縮圖與原圖**：上傳後排程產生多種尺寸，前端先載縮圖（縮短清單載入）。
- **隱私/分享**：Pin 可設定可見範圍；提供分享連結（public 時）。
- **線路徑**：依 `visited_at` 將多個 Pin 以弧線連接（航線視覺）。
- **離線草稿**：LocalStorage 暫存未送出的 Pin（避免表單遺失）。

---

## 開發順序建議（兩天 MVP）
1. 地球載入（Mapbox globe）+ 點擊取座標。
2. 表單（標題/留言/日期/連結）。
3. 後端 `POST /pins` 與 `GET /pins?bbox=`，前端載入清單。
4. S3 預簽名上傳 + Pin 附照片。
5. Marker/Popup 渲染與基本樣式。

> 若你偏好 **CesiumJS**，可以保留相同後端 API；前端把 `mapbox-gl` 改為 `resium + cesium`，Pin 使用 `Entity + BillboardGraphics`，表單仍走 React 自訂彈層。
