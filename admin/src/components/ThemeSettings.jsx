import React from 'react';
import { MdOutlineCancel, MdDarkMode, MdLightMode } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';
import { Tooltip } from '@mui/material';

import { themeColors } from '../Data/dummy';
import { useStateContext } from '../context/ContextProvider';

const ThemeSettings = () => {
  const { setColor, setMode, currentMode, currentColor, setThemeSettings } = useStateContext();

  const handleClose = () => setThemeSettings(false);

  return (
    <>
      {/* Backdrop — above everything */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        style={{ zIndex: 99998 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer — above backdrop */}
      <aside
        className="
          fixed top-0 right-0 h-screen
          w-80 flex flex-col
          bg-white dark:bg-[#2d3139]
          border-l border-gray-100 dark:border-gray-700/50
          shadow-2xl shadow-black/20
          animate-slide-in-left
        "
        style={{ zIndex: 99999 }}
        role="dialog"
        aria-label="Theme settings"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-base">
              Appearance
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Customize your dashboard theme
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="
              p-2 rounded-xl
              text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700/50
              transition-all duration-150 active:scale-90
            "
            aria-label="Close settings"
          >
            <MdOutlineCancel className="text-xl" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* Mode section */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
              Color Mode
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'Light', icon: <MdLightMode className="text-lg" />, label: 'Light' },
                { value: 'Dark',  icon: <MdDarkMode  className="text-lg" />, label: 'Dark'  },
              ].map(({ value, icon, label }) => {
                const active = currentMode === value;
                return (
                  <label
                    key={value}
                    htmlFor={value.toLowerCase()}
                    className={`
                      relative flex flex-col items-center gap-2
                      px-4 py-4 rounded-xl cursor-pointer
                      border transition-all duration-200
                      ${active
                        ? 'border-2 bg-gray-50 dark:bg-gray-800/60'
                        : 'border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
                      }
                    `}
                    style={active ? { borderColor: currentColor } : {}}
                  >
                    <input
                      type="radio"
                      id={value.toLowerCase()}
                      name="theme"
                      value={value}
                      className="sr-only"
                      onChange={setMode}
                      checked={active}
                    />
                    <span
                      className="p-2 rounded-lg"
                      style={active
                        ? { backgroundColor: `${currentColor}20`, color: currentColor }
                        : { color: '#9ca3af' }
                      }
                    >
                      {icon}
                    </span>
                    <span className={`text-sm font-medium ${active ? 'dark:text-gray-100 text-gray-800' : 'text-gray-400 dark:text-gray-500'}`}>
                      {label}
                    </span>
                    {active && (
                      <span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentColor }}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Color section */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
              Accent Color
            </p>
            <div className="flex flex-wrap gap-3">
              {themeColors.map((item, i) => {
                const active = item.color === currentColor;
                return (
                  <Tooltip key={i} title={item.name} placement="top" arrow>
                    <button
                      type="button"
                      onClick={() => setColor(item.color)}
                      className="
                        relative h-9 w-9 rounded-full
                        transition-all duration-200
                        hover:scale-110 active:scale-95
                        focus:outline-none
                      "
                      style={{
                        backgroundColor: item.color,
                        boxShadow: active
                          ? `0 0 0 3px white, 0 0 0 5px ${item.color}`
                          : 'none',
                      }}
                      aria-label={`Set theme color to ${item.name}`}
                      aria-pressed={active}
                    >
                      {active && (
                        <BsCheck className="text-white text-xl absolute inset-0 m-auto" />
                      )}
                    </button>
                  </Tooltip>
                );
              })}
            </div>

            {/* Current color preview */}
            <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Current accent</p>
                <p className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
                  {currentColor}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer / Save */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700/50">
          <button
            type="button"
            onClick={handleClose}
            className="
              w-full py-2.5 rounded-xl
              text-white text-sm font-semibold
              transition-all duration-200
              hover:opacity-90 active:scale-95
            "
            style={{
              backgroundColor: currentColor,
              boxShadow: `0 4px 14px ${currentColor}50`,
            }}
          >
            Save & Close
          </button>
        </div>
      </aside>
    </>
  );
};

export default ThemeSettings;