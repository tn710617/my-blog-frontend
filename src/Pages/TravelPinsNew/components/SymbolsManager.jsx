import React from 'react';
import { useMapStore } from '../stores/mapStore';
import { useTravelPins } from '../hooks/useTravelPinsApi';
import { assignColorsByScreen } from '../utils/colorManager';
import { SKIN_SCHEMES, CONTRAST_SCHEMES } from '../utils/palettes';

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
    if (loadedImages.has(name) || map.hasImage(name)) {
      loadedImages.add(name);
      resolve();
      return;
    }
    const svg = buildFootprintSVG(color);
    const img = new Image();
    img.onload = () => {
      try {
        map.addImage(name, img, { pixelRatio: 2 });
        loadedImages.add(name);
        resolve();
      } catch (e) {
        resolve();
      }
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
};

const ensureAllPaletteImages = async (map) => {
  const tasks = [];
  SKIN_SCHEMES.forEach((s, idx) => tasks.push(loadIconImage(map, `fp-skin-${idx}`, s.main)));
  CONTRAST_SCHEMES.forEach((s, idx) => tasks.push(loadIconImage(map, `fp-contrast-${idx}`, s.main)));
  await Promise.allSettled(tasks);
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
  const { mapInstance, isMapReady } = useMapStore();
  const { data: pins = [], isLoading } = useTravelPins();
  const assignedColorsRef = React.useRef(new Map());
  const hoverIdRef = React.useRef(null);

  React.useEffect(() => {
    if (!isMapReady || !mapInstance || isLoading) return;

    const map = mapInstance;
    let source = map.getSource(SOURCE_ID);

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
          console.log('Symbol pin clicked:', f.properties?.title || f.id);
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

    return () => {
      map.off('move', handleViewChange);
      map.off('zoom', handleViewChange);
      map.off('rotate', handleViewChange);
      map.off('pitch', handleViewChange);
      if (map.getLayer(HOVER_LAYER_ID)) map.removeLayer(HOVER_LAYER_ID);
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [isMapReady, mapInstance, isLoading, pins]);

  return null;
};

export default SymbolsManager;
