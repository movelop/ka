import React from "react";
import { Tooltip } from "@mui/material";
import { FiSettings } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { useStateContext } from "../context/ContextProvider";
import { Sidebar, Navbar, ThemeSettings, Footer } from "../components";

const AppWrapper = ({ children }) => {
  const {
    currentMode,
    setThemeSettings,
    themeSettings,
    currentColor,
    activeMenu,
  } = useStateContext();

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
            <div className="flex relative dark:bg-main-dark-bg">
                <div className="fixed right-4 bottom-4" style={{zIndex: '1000'}}>
                    <Tooltip 
                        title='Settings' 
                        placement='top'
                    >
                        <button
                            type='button'
                            onClick={() => setThemeSettings(true) }
                            className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
                            style={{background: currentColor, borderRadius: '50%'}}
                        >
                            <FiSettings />
                        </button>
                    </Tooltip>
                </div>
                {activeMenu ? (
                    <div className='w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white'>
                        <Sidebar/>
                    </div>
                ):(
                    <div className = 'w-0 dark:bg-secondary-dark-bg'>
                        <Sidebar/>
                    </div>
                )}
                <div className={ `dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${activeMenu ? 'md:ml-72': 'flex-2'}` }>
                    
                    <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                        <Navbar/>
                        <Toaster zIndex={999}  />
                    </div>
                    <div>
                        {themeSettings && <ThemeSettings/>}
                        {children}
                    </div>
                    <Footer/>
                </div>
            </div>
        </div>
  );
};

export default AppWrapper;
