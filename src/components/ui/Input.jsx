import React from 'react';
import clsx from 'clsx';

const Input = ({ className = '', type = 'text', ...props }) => {
  return (
    <input
      type={type}
      className={clsx(
        'w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};

export default Input;
