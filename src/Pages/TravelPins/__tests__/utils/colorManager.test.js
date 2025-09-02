import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  assignColorsByScreen, 
  recolorMarkers, 
  getColorAssignment, 
  createColorAssignmentRef 
} from '../../utils/colorManager';

// Mock the palette imports
vi.mock('../../utils/palettes', () => ({
  SKIN_SCHEMES: [
    { bg: '#f5c6a0', fg: '#8b4513' }, // light
    { bg: '#d2b48c', fg: '#654321' }, // medium
    { bg: '#8b4513', fg: '#f5deb3' }  // dark
  ],
  CONTRAST_SCHEMES: [
    { bg: '#ff0000', fg: '#ffffff' }, // red
    { bg: '#00ff00', fg: '#000000' }, // green
    { bg: '#0000ff', fg: '#ffffff' }  // blue
  ]
}));

// Mock buildFootprintHTML
vi.mock('../../utils/footprintIcon', () => ({
  buildFootprintHTML: vi.fn((scheme) => `<div style="background:${scheme.bg};color:${scheme.fg}">footprint</div>`)
}));

describe('colorManager', () => {
  let mockMap;
  let assignedColorsRef;
  let markersByIdRef;

  beforeEach(() => {
    // Mock Mapbox map with project method
    mockMap = {
      project: vi.fn()
    };
    
    assignedColorsRef = new Map();
    markersByIdRef = new Map();
    
    vi.clearAllMocks();
  });

  describe('createColorAssignmentRef', () => {
    it('should create a new Map', () => {
      const ref = createColorAssignmentRef();
      expect(ref).toBeInstanceOf(Map);
      expect(ref.size).toBe(0);
    });
  });

  describe('assignColorsByScreen', () => {
    it('should return reference if no map provided', () => {
      const pins = [{ id: '1', coordinates: [0, 0] }];
      const result = assignColorsByScreen(pins, null, assignedColorsRef);
      expect(result).toBe(assignedColorsRef);
      expect(assignedColorsRef.size).toBe(0);
    });

    it('should assign skin color to isolated pins', () => {
      const pins = [
        { id: '1', coordinates: [0, 0] },
        { id: '2', coordinates: [1, 1] }
      ];
      
      // Mock project to return distant screen coordinates
      mockMap.project.mockImplementation(({ lng, lat }) => {
        if (lng === 0 && lat === 0) return { x: 0, y: 0 };       // pin 1
        if (lng === 1 && lat === 1) return { x: 100, y: 100 };  // pin 2 (far away)
        return { x: 0, y: 0 };
      });
      
      assignColorsByScreen(pins, mockMap, assignedColorsRef);
      
      expect(assignedColorsRef.get('1')).toEqual({ palette: 'skin', idx: 1 });
      expect(assignedColorsRef.get('2')).toEqual({ palette: 'skin', idx: 1 });
    });

    it('should assign contrast colors to nearby pins', () => {
      const pins = [
        { id: '1', coordinates: [0, 0] },
        { id: '2', coordinates: [0.001, 0.001] }
      ];
      
      // Mock project method - the algorithm calls project for each pin during mapping phase
      mockMap.project.mockImplementation(({ lng, lat }) => {
        if (lng === 0 && lat === 0) return { x: 0, y: 0 };     // pin 1
        if (lng === 0.001 && lat === 0.001) return { x: 15, y: 15 }; // pin 2 (15√2 ≈ 21px < 28px)
        return { x: 0, y: 0 };
      });
      
      assignColorsByScreen(pins, mockMap, assignedColorsRef);
      
      
      // Pin '1' is processed first -> gets skin color (no neighbors)
      expect(assignedColorsRef.get('1')).toEqual({ palette: 'skin', idx: 1 });
      // Pin '2' is processed second -> detects '1' as neighbor but '1' has skin palette
      // -> so neighborColors is empty -> gets contrast color index 0
      expect(assignedColorsRef.get('2')).toEqual({ palette: 'contrast', idx: 0 });
    });

    it('should handle multiple nearby pins with different contrast colors', () => {
      const pins = [
        { id: '1', coordinates: [0, 0] },
        { id: '2', coordinates: [0.001, 0.001] },
        { id: '3', coordinates: [0.002, 0.002] }
      ];
      
      // Mock project method with coordinate-based responses
      mockMap.project.mockImplementation(({ lng, lat }) => {
        if (lng === 0 && lat === 0) return { x: 0, y: 0 };         // pin 1
        if (lng === 0.001 && lat === 0.001) return { x: 15, y: 15 }; // pin 2 (close to 1)
        if (lng === 0.002 && lat === 0.002) return { x: 20, y: 20 }; // pin 3 (close to both)
        return { x: 0, y: 0 };
      });
      
      assignColorsByScreen(pins, mockMap, assignedColorsRef);
      
      expect(assignedColorsRef.get('1')).toEqual({ palette: 'skin', idx: 1 });
      expect(assignedColorsRef.get('2')).toEqual({ palette: 'contrast', idx: 0 });
      expect(assignedColorsRef.get('3')).toEqual({ palette: 'contrast', idx: 1 });
    });

    it('should sort pins by ID for consistent assignment', () => {
      const pins = [
        { id: 'z', coordinates: [0, 0] },
        { id: 'a', coordinates: [0.001, 0.001] }
      ];
      
      mockMap.project.mockImplementation(({ lng, lat }) => {
        if (lng === 0 && lat === 0) return { x: 0, y: 0 };         // pin z
        if (lng === 0.001 && lat === 0.001) return { x: 15, y: 15 }; // pin a (close)
        return { x: 0, y: 0 };
      });
      
      assignColorsByScreen(pins, mockMap, assignedColorsRef);
      
      // Should process 'a' first (alphabetically), then 'z'
      expect(assignedColorsRef.get('a')).toEqual({ palette: 'skin', idx: 1 });
      expect(assignedColorsRef.get('z')).toEqual({ palette: 'contrast', idx: 0 });
    });

    it('should handle exactly threshold distance (28px)', () => {
      const pins = [
        { id: '1', coordinates: [0, 0] },
        { id: '2', coordinates: [0.001, 0.001] }
      ];
      
      // Exactly 28px distance
      mockMap.project.mockImplementation(({ lng, lat }) => {
        if (lng === 0 && lat === 0) return { x: 0, y: 0 };         // pin 1
        if (lng === 0.001 && lat === 0.001) return { x: 28, y: 0 }; // pin 2 (exactly 28px away)
        return { x: 0, y: 0 };
      });
      
      assignColorsByScreen(pins, mockMap, assignedColorsRef);
      
      // Should be considered neighbors (distance² = 784 <= 28²)
      expect(assignedColorsRef.get('1')).toEqual({ palette: 'skin', idx: 1 });
      expect(assignedColorsRef.get('2')).toEqual({ palette: 'contrast', idx: 0 });
    });
  });

  describe('recolorMarkers', () => {
    let mockMarker;
    let mockElement;

    beforeEach(() => {
      mockElement = {
        dataset: {},
        innerHTML: ''
      };
      
      mockMarker = {
        getElement: vi.fn(() => mockElement)
      };
    });

    it('should return early if no map provided', () => {
      const pins = [{ id: '1', coordinates: [0, 0] }];
      
      // Should not throw error
      recolorMarkers(pins, null, markersByIdRef, assignedColorsRef);
      
      expect(mockMap.project).not.toHaveBeenCalled();
    });

    it('should skip pins without markers', () => {
      const pins = [{ id: '1', coordinates: [0, 0] }];
      
      // No markers in markersByIdRef
      recolorMarkers(pins, mockMap, markersByIdRef, assignedColorsRef);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should skip markers without DOM elements', () => {
      const pins = [{ id: '1', coordinates: [0, 0] }];
      markersByIdRef.set('1', { getElement: vi.fn(() => null) });
      
      recolorMarkers(pins, mockMap, markersByIdRef, assignedColorsRef);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should update marker colors when assignment changes', async () => {
      const { buildFootprintHTML } = await import('../../utils/footprintIcon');
      const pins = [{ id: '1', coordinates: [0, 0] }];
      
      markersByIdRef.set('1', mockMarker);
      mockMap.project.mockReturnValue({ x: 0, y: 0 });
      
      // Set initial state
      mockElement.dataset.colorIdx = '0';
      mockElement.dataset.palette = 'contrast';
      
      recolorMarkers(pins, mockMap, markersByIdRef, assignedColorsRef);
      
      // Should update to skin palette
      expect(mockElement.dataset.colorIdx).toBe('1');
      expect(mockElement.dataset.palette).toBe('skin');
      expect(buildFootprintHTML).toHaveBeenCalledWith({ bg: '#d2b48c', fg: '#654321' });
    });

    it('should skip update if color assignment unchanged', async () => {
      const { buildFootprintHTML } = await import('../../utils/footprintIcon');
      const pins = [{ id: '1', coordinates: [0, 0] }];
      
      markersByIdRef.set('1', mockMarker);
      mockMap.project.mockReturnValue({ x: 0, y: 0 });
      
      // Set matching state
      mockElement.dataset.colorIdx = '1';
      mockElement.dataset.palette = 'skin';
      
      recolorMarkers(pins, mockMap, markersByIdRef, assignedColorsRef);
      
      // Should not call buildFootprintHTML since no change
      expect(buildFootprintHTML).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      const pins = [{ id: '1', coordinates: [0, 0] }];
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      // Mock error in assignColorsByScreen
      mockMap.project.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Should not throw
      expect(() => {
        recolorMarkers(pins, mockMap, markersByIdRef, assignedColorsRef);
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('Color recoloring error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getColorAssignment', () => {
    it('should return assignment if exists', () => {
      assignedColorsRef.set('1', { palette: 'contrast', idx: 2 });
      
      const result = getColorAssignment('1', assignedColorsRef);
      
      expect(result).toEqual({ palette: 'contrast', idx: 2 });
    });

    it('should return default assignment if not exists', () => {
      const result = getColorAssignment('nonexistent', assignedColorsRef);
      
      expect(result).toEqual({ palette: 'skin', idx: 1 });
    });

    it('should handle different pin ID types', () => {
      assignedColorsRef.set(123, { palette: 'contrast', idx: 1 });
      
      const result = getColorAssignment(123, assignedColorsRef);
      
      expect(result).toEqual({ palette: 'contrast', idx: 1 });
    });
  });
});