import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('roleChange'));
        navigate('/');
    };

    if (!role) return null;

    // Check if a route is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Get initials for avatar
    const getInitials = () => {
        if (user && user.name) {
            const names = user.name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return user.name.charAt(0).toUpperCase();
        }
        return role.charAt(0).toUpperCase();
    };

    return (
        <>
            {/* Mobile Toggle Button (outside sidebar) */}
            {isMobile && (
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="fixed z-50 top-4 left-4 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg hover:shadow-indigo-200 hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 lg:hidden"
                    aria-label="Toggle sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {collapsed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </button>
            )}

            {/* Main Sidebar */}
            <aside 
                className={`${
                    collapsed && isMobile ? '-translate-x-full' : 'translate-x-0'
                } fixed z-40 top-0 left-0 h-screen transition-all duration-500 ease-in-out
                ${collapsed && !isMobile ? 'w-20' : 'w-72'} 
                bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-r border-slate-700/50 backdrop-blur-sm`}
            >
                <div className="flex flex-col h-full">
                    {/* Header with Logo */}
                    <div className={`flex items-center justify-between px-6 py-5 border-b border-slate-700/50 ${collapsed && !isMobile ? 'justify-center px-4' : ''}`}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            {!collapsed || isMobile ? (
                                <h2 className="text-xl font-bold text-white tracking-wider animate-fadeIn drop-shadow-md">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Empower</span>
                                    <span className="text-gray-100">Link</span>
                                </h2>
                            ) : null}
                        </div>
                        
                        {/* Collapse Button (desktop only) */}
                        {!isMobile && (
                            <button 
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-gray-400 hover:text-white hover:bg-slate-700/50 p-1.5 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
                                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {collapsed ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-indigo-600">
                        <div className={`mb-6 ${collapsed && !isMobile ? 'text-center' : 'px-2'}`}>
                            <h3 className="text-xs uppercase font-semibold text-indigo-300 tracking-wider mb-2">
                                {!collapsed || isMobile ? "Main Menu" : "Menu"}
                            </h3>
                        </div>
                        <ul className="space-y-2.5">
                            <li>
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                    ${isActive('/dashboard') 
                                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                        : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Dashboard</span> : null}
                                    {isActive('/dashboard') && (!collapsed || isMobile) ? (
                                        <span className="ml-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    ) : null}
                                </Link>
                            </li>

                            {role === 'admin' && (
                                <>
                                    <div className={`mt-6 mb-2 ${collapsed && !isMobile ? 'text-center' : 'px-2'}`}>
                                        <h3 className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                                            {!collapsed || isMobile ? "Administration" : "Admin"}
                                        </h3>
                                    </div>
                                    <li>
                                        <Link 
                                            to="/manage-users" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/manage-users') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Manage Users</span> : null}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/adminforums" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/adminforums') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Manage Forums</span> : null}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/adminskills" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/adminskills') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Skills & Trainings</span> : null}
                                        </Link>
                                    </li>
                                </>
                            )}

                            {(role === 'admin' || role === 'employer') && (
                                <>
                                    <div className={`mt-6 mb-2 ${collapsed && !isMobile ? 'text-center' : 'px-2'}`}>
                                        <h3 className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                                            {!collapsed || isMobile ? "Job Management" : "Jobs"}
                                        </h3>
                                    </div>
                                    <li>
                                        <Link 
                                            to="/manage-jobs" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/manage-jobs') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Job Listings</span> : null}
                                        </Link>
                                    </li>
                                </>
                            )}

                            {role === 'employer' && (
                                <>
                                    <div className={`mt-6 mb-2 ${collapsed && !isMobile ? 'text-center' : 'px-2'}`}>
                                        <h3 className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                                            {!collapsed || isMobile ? "Talent Management" : "Talent"}
                                        </h3>
                                    </div>
                                    <li>
                                        <Link 
                                            to="/employerdashboard" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/employerdashboard') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Job Portal</span> : null}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/skillsemployers" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/skillsemployers') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Talent Search</span> : null}
                                        </Link>
                                    </li>
                                </>
                            )}

                            {role === 'user' && (
                                <>
                                    <div className={`mt-6 mb-2 ${collapsed && !isMobile ? 'text-center' : 'px-2'}`}>
                                        <h3 className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                                            {!collapsed || isMobile ? "Career Development" : "Career"}
                                        </h3>
                                    </div>
                                    <li>
                                        <Link 
                                            to="/my-skills" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/my-skills') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">My Skills</span> : null}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/job-matches" 
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                            ${isActive('/job-matches') 
                                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-900/20' 
                                                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${!collapsed || isMobile ? 'mr-3' : ''} transition-transform group-hover:scale-110 duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Job Matches</span> : null}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>

                    {/* Footer with User Info and Logout */}
                    <div className={`mt-auto p-5 border-t border-slate-700/50 ${collapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
                        <div className={`${collapsed && !isMobile ? 'text-center' : 'flex items-center mb-5'}`}>
                            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg
                                shadow-md hover:shadow-indigo-500/20 transform hover:scale-110 transition-all duration-300
                                ${collapsed && !isMobile ? 'mx-auto mb-3' : 'mr-3'}`}>
                                {getInitials()}
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></span>
                            </div>
                            {!collapsed || isMobile ? (
                                <div className="animate-fadeIn overflow-hidden">
                                    <h3 className="font-semibold tracking-wide text-white truncate">
                                        {user.name || role.charAt(0).toUpperCase() + role.slice(1)}
                                    </h3>
                                    <p className="text-xs text-indigo-300 tracking-wide truncate">
                                        {user.email || `${role}@skillbridge.com`}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl
                                text-white bg-gradient-to-r from-rose-500 to-pink-600 
                                hover:from-rose-600 hover:to-pink-700 
                                transition-all duration-300 ease-in-out 
                                transform hover:scale-105 shadow-md hover:shadow-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-50
                                ${collapsed && !isMobile ? 'p-2.5' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed && !isMobile ? '' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {!collapsed || isMobile ? <span className="animate-fadeIn font-medium">Logout</span> : null}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobile && !collapsed && (
                <div 
                    className="fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
                    onClick={() => setCollapsed(true)}
                ></div>
            )}
        </>
    );
};

// Add custom animations
const animations = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
}

.animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fadeUp {
    animation: fadeUp 0.5s ease-out forwards;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
}
`;

// Inject the animation styles
if (!document.querySelector('#sidebar-animations')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "sidebar-animations";
    styleSheet.type = "text/css";
    styleSheet.innerText = animations;
    document.head.appendChild(styleSheet);
}

export default Sidebar;