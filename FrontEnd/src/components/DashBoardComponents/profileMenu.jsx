import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/userStore/userSlice';
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useTheme } from '../../contexts/ThemeContext';

const ProfileMenu = () => {
  const { theme, isLightMode } = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleBlur = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setTimeout(() => setDropdownOpen(false), 100);
    }
  };

  return (
    <div className="relative" onBlur={handleBlur}>
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {currentUser ? (
          <img src={currentUser.profilepic} alt="Profile" className="h-8 w-8 rounded-full" />
        ) : (
          <UserCircleIcon className={`h-8 w-8 ${theme.text}`} />
        )}
        <span className="font-semibold">{currentUser?.fullName}</span>
      </button>

      {dropdownOpen && (
        <div ref={dropdownRef} className={`absolute right-0 mt-2 w-56 ${theme.background} border border-gray-200 rounded-md shadow-lg z-50`}>
          {currentUser?.role === 'Admin' || currentUser?.role === 'superAdmin' ? (
            <>
              <Link to="/requested_events" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Requested Events
              </Link>
              <Link to="/createEvent" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Create Event
              </Link>
              <Link to="/my-events" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                My Events
              </Link>
              <Link to="/my-tickets" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                My Tickets
              </Link>

              {/* Reports Group */}
              <div className="px-4 py-2 font-medium text-sm text-gray-500">Reports</div>
              <Link to="/admin/export" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Export Data
              </Link>
              <Link to="/admin/stats" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Event Stats
              </Link>
              <Link to="/admin/tickets" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Event Tickets
              </Link>

              {currentUser?.role === 'superAdmin' && (
                <>
                  <div className="px-4 py-2 font-medium text-sm text-gray-500">Management</div>
                  <Link to="/admin/dashboard" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                    User Management
                  </Link>
                </>
              )}

              <Link to="/updateProfile" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className={`block w-full text-left px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/createEvent" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Create Event
              </Link>
              <Link to="/my-events" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                My Events
              </Link>
              <Link to="/my-tickets" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                My Tickets
              </Link>
              <Link to="/updateProfile" className={`block px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}>
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className={`block w-full text-left px-4 py-2 ${isLightMode ? theme.text : 'text-black'} hover:bg-gray-100`}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
