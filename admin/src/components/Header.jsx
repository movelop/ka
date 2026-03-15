import React from 'react';
import { useStateContext } from '../context/ContextProvider';

const Header = ({ category, title }) => {
  const { currentColor } = useStateContext();

  return (
    <div className='mb-8'>
      {/* Category */}
      <div className='flex items-center gap-2 mb-1'>
        <span
          className='inline-block w-1 h-3 rounded-full'
          style={{ backgroundColor: currentColor }}
        />
        <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500'>
          {category}
        </p>
      </div>

      {/* Title */}
      <p className='text-2xl md:text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100 capitalize'>
        {title}
      </p>
    </div>
  );
};

export default Header;