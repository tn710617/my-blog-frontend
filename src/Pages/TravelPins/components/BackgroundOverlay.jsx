import React from 'react';
import { Z_INDEX } from '../utils/zIndex';

const BackgroundOverlay = ({ show, onClick }) => {
  if (!show) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      style={{ zIndex: Z_INDEX.POPUP_BACKGROUND }}
      onClick={onClick}
    />
  );
};

export default BackgroundOverlay;