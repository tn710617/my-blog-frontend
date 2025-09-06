import React from 'react';
import { useIntl } from 'react-intl';
import { useMapStore } from '../stores/mapStore';
import { useTravelPins } from '../hooks/useTravelPinsApi';
import { assignColorsByScreen } from '../utils/colorManager';
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from '../utils/palettes';
// import { createPopup, updatePopup } from '../utils/popupFactory';
import { useModalStore } from '../stores/modalStore';
import { setDisplayPopupCloser, clearDisplayPopupCloser, setDisplayPopupOpener } from '../utils/displayPopupController';
import { copyPinUrlToClipboard, getPinIdFromUrl, updateUrlWithPin } from '../utils/urlUtils';
import { useAuthStore, useLoginModalStore } from '../../../stores';

const SOURCE_ID = 'travel-pins-source';
const LAYER_ID = 'travel-pins-layer';
const HOVER_LAYER_ID = 'travel-pins-layer-hover';

// Build a simple footprint SVG (28x28) with the given color
const buildFootprintSVG = (color) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 193.736 193.736">
    <defs>
      <filter id="shadow2" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>
    <g fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow2)">
      <path d="M163.459,126.139c-1.72-28.186-46.4-49.719-70.769-40.617c-0.219,0.082-0.411,0.186-0.597,0.293
        c-28.324-0.719-68.175,19.519-55.087,53.387c9.106,23.562,48.151,26.031,69.125,26.032
        C129.208,165.235,165.215,154.896,163.459,126.139z M106.192,150.854c1.618,0.01,3.24-0.021,4.865-0.078
        c0.376,0.033,0.755,0.017,1.137-0.051c0.904-0.04,1.811-0.096,2.717-0.153c0.025,0.03,0.041,0.071,0.067,0.101
        c-4.957,0.653-9.959,0.954-14.967,0.849C102.071,151.326,104.131,151.144,106.192,150.854z M83.599,156.708
        c2.961,0.567,5.935,1.058,8.924,1.388c-3.164-0.162-6.377-0.444-9.591-0.866C83.183,157.094,83.394,156.905,83.599,156.708z"/>
      <path d="M49.35,40.128C37.704,24.875,15.209,25.38,4.425,41.741C-5.64,57.01,2.93,75.539,15.462,86.38
        c8.108,7.014,21.558,10.902,27.666,2.45c0.454-0.056,0.925-0.221,1.402-0.52C61.518,77.665,60.488,54.715,49.35,40.128z
         M50.806,67.27c0.567-2.231,0.733-4.578,0.613-6.957c0.081-0.12,0.15-0.244,0.215-0.376c0.337,3.155,0.121,6.299-0.689,9.276
        C50.928,68.569,50.878,67.921,50.806,67.27z"/>
      <path d="M72.884,32.114c-0.922,0.615-1.274,1.656-1.195,2.648c-7.795,8.365-9.45,21.916-5.251,32.327
        c5.066,12.56,19.968,14.367,30.321,6.906C117.588,58.984,97.253,15.839,72.884,32.114z M82.613,35.85
        c-0.414-0.187-0.842-0.34-1.284-0.46c4.261-0.515,7.964,0.617,11.073,3.632c-0.015-0.005-0.031-0.008-0.046-0.013
        c-0.633-0.54-1.437-0.781-2.275-0.786C88.171,36.482,85.7,35.554,82.613,35.85z"/>
      <path d="M131.677,33.131c-1.005,0.137-1.56,0.738-1.777,1.479c-0.384,0.032-0.768,0.13-1.136,0.346
        c-0.914,0.535-1.296,1.413-1.492,2.36c-0.583-0.348-1.317-0.396-2.052,0.108c-16.797,11.525-17.24,45.928,9.248,40.183
        C157.274,72.66,157.445,29.613,131.677,33.131z"/>
      <path d="M192.231,67.035c-3.626-9.364-15.854-16.538-23.952-7.555c-0.104,0.116-0.167,0.247-0.24,0.375
        c-2.318,0.107-4.421,0.895-5.956,2.462c-6.195,3.264-9.801,10.884-9.428,18.463c0.718,14.578,16.646,17.841,28.120,13.546
        C191.8,90.199,196.364,77.707,192.231,67.035z"/>
    </g>
  </svg>
`;

const loadedImages = new Set();

const loadIconImage = (map, name, color) => {
  return new Promise((resolve, reject) => {
    // 檢查地圖是否仍然有效
    if (!map || !map.addImage || typeof map.addImage !== 'function') {
      return resolve(); // 靜默失敗，避免阻塞
    }
    
    try {
      if (loadedImages.has(name) || (map.hasImage && map.hasImage(name))) {
        loadedImages.add(name);
        resolve();
        return;
      }
    } catch (e) {
      // hasImage 可能失敗，忽略並繼續載入
    }
    
    const svg = buildFootprintSVG(color);
    const img = new Image();
    img.onload = () => {
      try {
        // 再次檢查地圖是否有效
        if (map.addImage && typeof map.addImage === 'function') {
          map.addImage(name, img, { pixelRatio: 2 });
          loadedImages.add(name);
        }
        resolve();
      } catch (e) {
        console.warn(`Failed to add image ${name}:`, e.message);
        resolve(); // 不 reject，避免阻塞其他圖片
      }
    };
    img.onerror = (e) => {
      console.warn(`Failed to load image ${name}`);
      resolve(); // 改為 resolve 而不是 reject
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
};

const ensureAllPaletteImages = async (map) => {
  // 確保地圖仍然有效
  if (!map || !map.getCanvas || !map.getCanvas()) {
    console.warn('Map invalid during image loading');
    return;
  }
  
  try {
    if (!map.isStyleLoaded()) {
      console.warn('Map style not ready for image loading');
      return;
    }
  } catch {
    console.warn('Cannot check map style status');
    return;
  }
  
  const tasks = [];
  SKIN_SCHEMES.forEach((s, idx) => tasks.push(loadIconImage(map, `fp-skin-${idx}`, s.main)));
  CONTRAST_SCHEMES.forEach((s, idx) => tasks.push(loadIconImage(map, `fp-contrast-${idx}`, s.main)));
  
  const results = await Promise.allSettled(tasks);
  
  // 檢查載入失敗的圖片
  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`${failed} images failed to load`);
  }
};

const hashToIdx = (id, modulo) => {
  try {
    const s = String(id);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % modulo;
  } catch {
    return 0;
  }
};

const buildFeatureCollection = (pins, map, assignedColorsRef) => {
  // 先根據畫面距離分配顏色
  assignColorsByScreen(pins, map, assignedColorsRef);
  const features = pins.map((pin) => {
    const assign = assignedColorsRef.get(pin.id) || { palette: 'contrast', idx: 0 };
    // 為了提升辨識度，統一使用對比色圖示；若原本是 skin，改成以 id 決定的對比色索引
    const idx = assign.palette === 'contrast' ? assign.idx : hashToIdx(pin.id, CONTRAST_SCHEMES.length);
    const icon = `fp-contrast-${idx}`;
    return {
      type: 'Feature',
      id: pin.id,
      properties: {
        icon,
        title: pin.title || '',
      },
      geometry: {
        type: 'Point',
        coordinates: pin.coordinates,
      },
    };
  });
  return { type: 'FeatureCollection', features };
};

const SymbolsManager = () => {
  const intl = useIntl();
  const { mapInstance, isMapReady } = useMapStore();
  const { data: pins = [], isLoading } = useTravelPins();
  const assignedColorsRef = React.useRef(new Map());
  const hoverIdRef = React.useRef(null);
  const openPopupRef = React.useRef(null); // legacy ref no longer used for Mapbox Popup
  const openPinRef = React.useRef(null);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const setShowLoginModal = useLoginModalStore((s) => s.setShowLoginModal);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const deepLinkHandledRef = React.useRef(false);
  
  // Create proper translation function
  const t = React.useCallback((key) => intl.formatMessage({ id: key }), [intl]);
  const formatDate = React.useCallback((date) => intl.formatDate(new Date(date)), [intl]);

  const openPinPopup = React.useCallback((map, pin) => {
    if (!map || !pin) return;
    // React-based fixed-position display popup (no Mapbox Popup)
    openPinRef.current = pin;
    // Provide global open/close hooks for overlay and others
    setDisplayPopupCloser(() => { try { useModalStore.getState().closeModal(); } catch {} });
    setDisplayPopupOpener((p) => { try { useModalStore.getState().openModal('display', { pin: p }); } catch {} });
    // Update URL for deep link consistency
    try { updateUrlWithPin(pin.id); } catch {}
    // Open display popup with pin data
    try { openModal('display', { pin }); } catch (e) { console.error(e); }
  }, [openModal]);

  React.useEffect(() => {
    if (!isMapReady || !mapInstance || isLoading) return;

    const map = mapInstance;
    
    // 強化地圖實例有效性檢查 - 使用更可靠的檢查方式
    if (!map || typeof map.getCanvas !== 'function') {
      console.warn('Map instance invalid - canvas method not available');
      return;
    }
    
    const canvas = map.getCanvas();
    // 在 StrictMode 或 locale 重新掛載過程中，可能短暫拿不到 canvas；此時直接安靜返回，等下一輪依賴變更再初始化
    if (!canvas || (canvas && !canvas.isConnected)) {
      return;
    }
    
    // 確保地圖樣式已載入
    const waitForStyleLoad = () => {
      try {
        // 在 MapContainer 的 'load' 後才會設置 mapInstance，因此一般情況下此處應已載入完成
        // 仍保險檢查一次；若尚未完成，使用一次性事件監聽
        if (map.isStyleLoaded && map.isStyleLoaded()) {
          // 使用 rAF 等到下一個 frame，避開 StrictMode 的雙次副作用時序
          requestAnimationFrame(() => {
            if (map.getCanvas && map.getCanvas()) initializeMapSymbols();
          });
          return;
        }
        // 後備：等待首次完整載入
        const onStyleLoaded = () => {
          map.off('style.load', onStyleLoaded);
          requestAnimationFrame(() => {
            if (map.getCanvas && map.getCanvas()) initializeMapSymbols();
          });
        };
        map.on('style.load', onStyleLoaded);
      } catch {
        // 若檢查失敗（例如地圖已被移除），安靜略過，等待下一輪依賴變更
      }
    };
    
    const initializeMapSymbols = () => {
    
    // 如果這是一個新的地圖實例，清除圖片快取以確保重新載入
    loadedImages.clear();
    
    let source;
    try {
      source = map.getSource ? map.getSource(SOURCE_ID) : null;
    } catch (error) {
      console.warn('Failed to get source, map may be invalid:', error);
      return;
    }

    const setup = async () => {
      // 確保圖示已註冊
      await ensureAllPaletteImages(map);

      // 建立或更新 Source
      const data = buildFeatureCollection(pins, map, assignedColorsRef.current);
      if (!source) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data,
        });
      } else {
        source.setData(data);
      }

      // 建立 Layer（如果不存在）
      if (!map.getLayer(LAYER_ID)) {
        // 基底層：正常大小與不透明度
        map.addLayer({
          id: LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          layout: {
            'icon-image': ['get', 'icon'],
            // 放大基底圖示，增加辨識度
            'icon-size': 1.3,
            'icon-allow-overlap': true,
          },
          paint: {
            'icon-opacity': 1.0,
          },
        });

        // Hover 層：放大且降低不透明度，只顯示目前 hover 的 feature
        map.addLayer({
          id: HOVER_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          layout: {
            'icon-image': ['get', 'icon'],
            // hover 再放大一些
            'icon-size': 1.5,
            'icon-allow-overlap': true,
          },
          paint: {
            'icon-opacity': 0.65,
          },
          filter: ['==', ['id'], -1], // 起始不顯示任何 feature
        });

        const setHoverFilter = (fid) => {
          try {
            map.setFilter(HOVER_LAYER_ID, ['==', ['id'], fid]);
          } catch {}
        };

        // 事件：使用 mousemove 更新 hover 目標；mouseleave 清空
        const onMouseMove = (e) => {
          map.getCanvas().style.cursor = 'pointer';
          const fid = e.features?.[0]?.id;
          if (fid == null) return;
          hoverIdRef.current = fid;
          setHoverFilter(fid);
        };

        const onMouseLeave = () => {
          map.getCanvas().style.cursor = '';
          hoverIdRef.current = null;
          setHoverFilter(-1);
        };

        map.on('mousemove', LAYER_ID, onMouseMove);
        map.on('mouseleave', LAYER_ID, onMouseLeave);
        map.on('mousemove', HOVER_LAYER_ID, onMouseMove);
        map.on('mouseleave', HOVER_LAYER_ID, onMouseLeave);

        const onClick = (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const pinId = f.id;
          const pin = pins.find((p) => String(p.id) === String(pinId));
          if (!pin) return;
          openPinPopup(map, pin);
        };
        map.on('click', LAYER_ID, onClick);
        map.on('click', HOVER_LAYER_ID, onClick);
      }
    };

    setup();

    // 在移動/縮放/旋轉/傾斜時重新分配顏色，更新 source data
    const handleViewChange = () => {
      const s = map.getSource(SOURCE_ID);
      if (!s) return;
      try {
        const updated = buildFeatureCollection(pins, map, assignedColorsRef.current);
        s.setData(updated);
      } catch {}
    };

    map.on('move', handleViewChange);
    map.on('zoom', handleViewChange);
    map.on('rotate', handleViewChange);
    map.on('pitch', handleViewChange);

    // Map background click to create new pin (avoid when clicking on symbols)
    const onMapBackgroundClick = (e) => {
      try {
        const hits = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID, HOVER_LAYER_ID] });
        if (hits && hits.length) return; // symbol click handled elsewhere
      } catch {}

      if (!isLoggedIn) {
        try { setShowLoginModal(true); } catch {}
        return;
      }
      // Close current popup if any, then open form modal with draft at clicked coords
      try { if (openPopupRef.current) openPopupRef.current.remove(); } catch {}
      const draft = { coordinates: [e.lngLat.lng, e.lngLat.lat] };
      try { openModal('form', { draft }); } catch (err) { console.error(err); }
    };
    map.on('click', onMapBackgroundClick);

    return () => {
      // 更強的地圖實例有效性檢查
      if (!map || !map.getCanvas || !map.getCanvas()) return;
      
      // 進一步檢查地圖是否還在 DOM 中且未被移除
      try {
        if (map.isStyleLoaded && !map.isStyleLoaded()) return;
      } catch {
        // 如果 isStyleLoaded 本身拋錯，說明地圖已經無效
        return;
      }
      
      try {
        // 移除事件監聽器
        if (typeof map.off === 'function') {
          map.off('move', handleViewChange);
          map.off('zoom', handleViewChange);
          map.off('rotate', handleViewChange);
          map.off('pitch', handleViewChange);
          map.off('click', onMapBackgroundClick);
        }
        
        // 安全移除 popup
        if (openPopupRef.current && typeof openPopupRef.current.remove === 'function') {
          openPopupRef.current.remove();
        }
        
        // 安全移除圖層和來源 - 檢查每個方法是否存在
        if (typeof map.getLayer === 'function' && typeof map.removeLayer === 'function') {
          if (map.getLayer(HOVER_LAYER_ID)) map.removeLayer(HOVER_LAYER_ID);
          if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        }
        if (typeof map.getSource === 'function' && typeof map.removeSource === 'function') {
          if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
        }
      } catch (error) {
        console.warn('SymbolsManager cleanup error:', error);
      }
    };
    };
    
    // 開始初始化流程
    waitForStyleLoad();
  }, [isMapReady, mapInstance, isLoading, pins, isLoggedIn, setShowLoginModal]);

  // React-based DisplayPopup renders from modal store; updates are driven by store/pins state naturally.

  // 註冊開啟顯示視窗的入口，供 Delete Modal 取消後回到顯示視窗
  React.useEffect(() => {
    if (!isMapReady || !mapInstance) return;
    setDisplayPopupOpener((pin) => openPinPopup(mapInstance, pin));
    return () => setDisplayPopupOpener(null);
  }, [isMapReady, mapInstance, openPinPopup]);

  // Deep-link：在載入完成後，若 URL 有 ?pin=<id>，自動置中並開啟該 pin 的 popup
  React.useEffect(() => {
    if (!isMapReady || !mapInstance || !pins?.length || deepLinkHandledRef.current) return;
    const idFromUrl = getPinIdFromUrl?.();
    if (!idFromUrl) return;
    const pin = pins.find((p) => String(p.id) === String(idFromUrl));
    if (!pin) return;
    deepLinkHandledRef.current = true;

    try {
      const targetZoom = Math.max(mapInstance.getZoom?.() ?? 2, 4.5);
      mapInstance.easeTo({ center: pin.coordinates, zoom: targetZoom, duration: 900 });
      
      // 確保只執行一次開啟動作，避免 moveend 和 timeout 競態
      let popupOpened = false;
      const openOnce = () => {
        if (popupOpened) return;
        popupOpened = true;
        try { openPinPopup(mapInstance, pin); } catch {}
      };
      
      mapInstance.once('moveend', openOnce);
      // 後備：若 moveend 未觸發，0.95s 後也嘗試開啟
      setTimeout(openOnce, 950);
    } catch {
      try { openPinPopup(mapInstance, pin); } catch {}
    }
  }, [isMapReady, mapInstance, pins, openPinPopup]);

  return null;
};

export default SymbolsManager;
