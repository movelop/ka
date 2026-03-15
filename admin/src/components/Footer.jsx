import React from 'react';
import { useStateContext } from '../context/ContextProvider';

const Footer = () => {
  const { currentColor } = useStateContext();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-100 dark:border-gray-800">
      
      {/* Accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentColor}80, transparent)`,
        }}
      />

      <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200 uppercase">
            K.A Hotel & Suites
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {year} All rights reserved
        </p>

        {/* Tagline */}
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Your comfort, our priority. 
        </p>

      </div>
    </footer>
  );
};

export default Footer;