import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const role = localStorage.getItem('role');
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

    return (
        <>
            {/* Mobile Toggle Button (outside sidebar) */}
            {isMobile && (
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="fixed z-50 top-4 left-4 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 lg:hidden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {collapsed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </button>
            )}

            {/* Main Sidebar */}
            <aside 
                className={`${
                    collapsed && isMobile ? '-translate-x-full' : 'translate-x-0'
                } fixed z-40 top-0 left-0 h-screen transition-all duration-300 ease-in-out
                ${collapsed && !isMobile ? 'w-20' : 'w-64'} 
                bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl`}
            >
                <div className="flex flex-col h-full">
                    {/* Header with Logo */}
                    <div className={`flex items-center justify-between p-4 border-b border-gray-700 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 bg-blue-600 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            {!collapsed || isMobile ? (
                                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                            ) : null}
                        </div>
                        
                        {/* Collapse Button (desktop only) */}
                        {!isMobile && (
                            <button 
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-gray-400 hover:text-white transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {collapsed ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        <ul className="space-y-2">
                            <li>
                                <Link 
                                    to="/dashboard" 
                                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                                    ${isActive('/dashboard') 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    {!collapsed || isMobile ? <span>Dashboard</span> : null}
                                </Link>
                            </li>

                            {role === 'admin' && (
                                <li>
                                    <Link 
                                        to="/manage-users" 
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${isActive('/manage-users') 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        {!collapsed || isMobile ? <span>Manage Users</span> : null}
                                    </Link>
                                    <Link 
                                        to="/adminforums" 
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${isActive('/manage-users') 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        {!collapsed || isMobile ? <span>Manage Forums</span> : null}
                                    </Link>
                                </li>
                            )}

                            {(role === 'admin' || role === 'employer') && (
                                <li>
                                    <Link 
                                        to="/manage-jobs" 
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${isActive('/manage-jobs') 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {!collapsed || isMobile ? <span>Job Listings</span> : null}
                                    </Link>
                                </li>
                            )}

                            {role === 'employer' && (
                                <li>
                                    <Link 
                                        to="/employerdashboard" 
                                        className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${isActive('/employerdashboard') 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {!collapsed || isMobile ? <span>Job Portal</span> : null}
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* Footer with User Info and Logout */}
                    <div className={`mt-auto p-4 border-t border-gray-700 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}>
                        <div className={`${collapsed && !isMobile ? '' : 'flex items-center mb-4'}`}>
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg
                                ${collapsed && !isMobile ? 'mx-auto mb-4' : 'mr-3'}`}>
                                {role.charAt(0).toUpperCase()}
                            </div>
                            {!collapsed || isMobile ? (
                                <div>
                                    <h3 className="font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</h3>
                                    <p className="text-sm text-gray-400">Role: {role}</p>
                                </div>
                            ) : null}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-white bg-gray-700 hover:bg-red-600 transition-colors duration-200
                                ${collapsed && !isMobile ? 'p-2' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${collapsed && !isMobile ? '' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {!collapsed || isMobile ? <span>Logout</span> : null}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobile && !collapsed && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setCollapsed(true)}
                ></div>
            )}

            {/* Main content wrapper - removed auto margin spacing */}
            <div className="transition-all duration-300">
                {/* Your main content goes here */}
            </div>
        </>
    );
};

export default Sidebar;