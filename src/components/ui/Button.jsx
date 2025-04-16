import React from 'react';
import clsx from 'clsx';

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  const base = 'rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    ghost: 'bg-transparent text-gray-700 hover:text-black',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
