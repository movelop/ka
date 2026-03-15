import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdOutlineCancel } from 'react-icons/md';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Tooltip } from '@mui/material';

import { links } from '../Data/dummy';
import { useStateContext } from '../context/ContextProvider';
import { AuthContext } from '../context/AuthContextProvider';

// ─── Style Constants ──────────────────────────────────────────────────────────

const BASE_LINK    = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md m-2';
const ACTIVE_LINK  = `${BASE_LINK} text-white`;
const NORMAL_LINK  = `${BASE_LINK} text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray`;

// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } = useStateContext();
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const handleCloseSidebar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  if (!activeMenu) return null;

  return (
    <div className="flex flex-col h-screen overflow-y-auto overflow-x-hidden pb-10 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">

  {/* ── Header / Brand ── */}
  <div className="flex justify-between items-center px-4 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
    <Link
      to="/"
      onClick={handleCloseSidebar}
      className="flex flex-col gap-0.5 group"
    >
      <span
        className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 group-hover:text-gray-500 transition-colors"
      >
        K.A
      </span>
      <span
        className="text-base font-extrabold tracking-tight text-gray-800 dark:text-white leading-tight group-hover:opacity-80 transition-opacity"
      >
        Hotel & Suites
      </span>
    </Link>

    <Tooltip title="Close menu" placement="right">
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={() => setActiveMenu(false)}
        style={{ color: currentColor }}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <MdOutlineCancel size={18} />
      </button>
    </Tooltip>
  </div>

  {/* ── Nav Links ── */}
  <nav className="flex-1 mt-4 px-2">
    {links.map((section) => (
      <div key={section.title} className="mb-6">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 dark:text-gray-600 px-3 mb-2">
          {section.title}
        </p>
        {section.links.map((link) => (
          <NavLink
            key={link.name}
            to={`/${link.name}`}
            onClick={handleCloseSidebar}
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: `${currentColor}18`, color: currentColor }
                : {}
            }
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5
              ${
                isActive
                  ? "font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="text-base flex-shrink-0 transition-transform duration-150"
                  style={isActive ? { color: currentColor } : {}}
                >
                  {link.icon}
                </span>
                <span className="capitalize truncate">{link.name}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: currentColor }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    ))}
  </nav>

  {/* ── Logout ── */}
  <div className="px-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
        text-red-500 dark:text-red-400
        hover:bg-red-50 dark:hover:bg-red-900/20
        transition-all duration-150"
    >
      <ExitToAppIcon fontSize="small" />
      <span>Logout</span>
    </button>
  </div>

</div>
  );
};

export default Sidebar;