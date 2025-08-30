import React, { useState, useCallback } from 'react';
import { Viewer, Entity, PointGraphics, LabelGraphics } from 'resium';
import * as Cesium from 'cesium';

// Major world cities with coordinates
const majorCities = [
  { name: "New York", longitude: -74.006, latitude: 40.7128 },
  { name: "London", longitude: -0.1276, latitude: 51.5074 },
  { name: "Tokyo", longitude: 139.6917, latitude: 35.6895 },
  { name: "Paris", longitude: 2.3522, latitude: 48.8566 },
  { name: "Sydney", longitude: 151.2093, latitude: -33.8688 },
  { name: "Los Angeles", longitude: -118.2437, latitude: 34.0522 },
  { name: "Singapore", longitude: 103.8198, latitude: 1.3521 },
  { name: "Dubai", longitude: 55.2708, latitude: 25.2048 },
  { name: "Hong Kong", longitude: 114.1694, latitude: 22.3193 },
  { name: "Mumbai", longitude: 72.8777, latitude: 19.0760 },
  { name: "São Paulo", longitude: -46.6333, latitude: -23.5505 },
  { name: "Cairo", longitude: 31.2357, latitude: 30.0444 },
  { name: "Moscow", longitude: 37.6176, latitude: 55.7558 },
  { name: "Beijing", longitude: 116.4074, latitude: 39.9042 },
  { name: "Istanbul", longitude: 28.9784, latitude: 41.0082 }
];

const EarthGlobe = () => {
  const [pins, setPins] = useState([]);

  const handleClick = useCallback((click, target) => {
    const position = click.position;
    if (!position) return;

    // Convert Cartesian3 to longitude/latitude
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);

    const newPin = {
      id: Date.now(),
      longitude,
      latitude,
      note: '',
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0)
    };

    setPins(prevPins => [...prevPins, newPin]);
  }, []);

  const handlePinClick = useCallback((pinId) => {
    const pin = pins.find(p => p.id === pinId);
    if (!pin) return;

    const newNote = prompt('Enter note for this location:', pin.note);
    if (newNote !== null) {
      setPins(prevPins => 
        prevPins.map(p => 
          p.id === pinId ? { ...p, note: newNote } : p
        )
      );
    }
  }, [pins]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Viewer
        full
        onClick={handleClick}
        timeline={false}
        animation={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        baseLayerPicker={false}
        geocoder={false}
        fullscreenButton={false}
      >
        {/* Major city labels */}
        {majorCities.map((city) => (
          <Entity
            key={city.name}
            name={city.name}
            position={Cesium.Cartesian3.fromDegrees(city.longitude, city.latitude, 0)}
          >
            <PointGraphics
              pixelSize={8}
              color={Cesium.Color.YELLOW}
              outlineColor={Cesium.Color.BLACK}
              outlineWidth={2}
            />
            <LabelGraphics
              text={city.name}
              font="14px Helvetica"
              fillColor={Cesium.Color.WHITE}
              outlineColor={Cesium.Color.BLACK}
              outlineWidth={2}
              style={Cesium.LabelStyle.FILL_AND_OUTLINE}
              pixelOffset={new Cesium.Cartesian2(0, -50)}
              showBackground={true}
              backgroundColor={Cesium.Color.BLACK.withAlpha(0.7)}
              backgroundPadding={new Cesium.Cartesian2(7, 5)}
            />
          </Entity>
        ))}

        {/* User-placed pins */}
        {pins.map((pin) => (
          <Entity
            key={pin.id}
            name={pin.note || 'User Pin'}
            position={pin.position}
            description={pin.note || 'Click to add a note'}
            onClick={() => handlePinClick(pin.id)}
          >
            <PointGraphics
              pixelSize={12}
              color={Cesium.Color.RED}
              outlineColor={Cesium.Color.WHITE}
              outlineWidth={2}
            />
            {pin.note && (
              <LabelGraphics
                text={pin.note}
                font="12px Helvetica"
                fillColor={Cesium.Color.WHITE}
                outlineColor={Cesium.Color.BLACK}
                outlineWidth={1}
                style={Cesium.LabelStyle.FILL_AND_OUTLINE}
                pixelOffset={new Cesium.Cartesian2(0, -30)}
                showBackground={true}
                backgroundColor={Cesium.Color.RED.withAlpha(0.7)}
                backgroundPadding={new Cesium.Cartesian2(5, 3)}
              />
            )}
          </Entity>
        ))}
      </Viewer>
    </div>
  );
};

export default EarthGlobe;