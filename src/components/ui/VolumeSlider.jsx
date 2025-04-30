import React from 'react';
import clsx from 'clsx';

const VolumeSlider = ({ volume, onChange, className = '' }) => {
  return (
    <div className={clsx('h-32 w-8 flex items-center justify-center', className)}>
      <div className="transform rotate-[-90deg] origin-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Volume"
          className="
            w-32 h-2 appearance-none bg-blue-200 rounded-full
            focus:outline-none focus:ring-2 focus:ring-blue-400
            transition cursor-pointer
          "
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
