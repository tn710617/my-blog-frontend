// Default animation duration (in milliseconds)
const DEFAULT_DURATION = 1000;

// Default zoom levels for different contexts
export const ZOOM_LEVELS = {
    WORLD: 1,
    CONTINENT: 3,
    COUNTRY: 5,
    CITY: 10,
    STREET: 15,
};

// Fly to specific coordinates with zoom
export const flyToLocation = (map, {longitude, latitude, zoom = ZOOM_LEVELS.COUNTRY, duration = DEFAULT_DURATION}) => {
    if (!map) {
        console.warn('Map instance not available for flyTo');
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        map.flyTo({
            center: [longitude, latitude],
            zoom,
            duration,
            essential: true, // This animation is considered essential with respect to prefers-reduced-motion
        });

        // Resolve after animation completes
        setTimeout(resolve, duration + 100);
    });
};

