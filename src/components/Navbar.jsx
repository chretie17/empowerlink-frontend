import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ loggedIn }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);
    
    const handleLogout = () => {
        localStorage.removeItem('role');
        // Force a page refresh to ensure the app recognizes the logout state
        navigate('/');
        window.location.reload();
    };
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };
    
    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out ${
            scrolled 
                ? 'bg-white/90 backdrop-blur-md shadow-lg' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo section */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className={`flex items-center space-x-2 ${
                            scrolled ? 'text-blue-600' : 'text-white'
                        }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <span className="font-bold text-xl tracking-tight">YourBrand</span>
                        </Link>
                    </div>
                    
                    {/* Desktop menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            <Link 
                                to="/" 
                                className={`px-3 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ease-in-out ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                        : 'text-blue-100 hover:text-white hover:bg-blue-500/50'
                                }`}
                            >
                                Home
                            </Link>
                            
                            {!loggedIn ? (
                                <>
                                    <Link 
                                        to="/login" 
                                        className={`px-3 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ease-in-out ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                                : 'text-blue-100 hover:text-white hover:bg-blue-500/50'
                                        }`}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                                            scrolled
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                                : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/jobs" 
                                        className={`px-3 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ease-in-out ${
                                            scrolled 
                                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                                : 'text-blue-100 hover:text-white hover:bg-blue-500/50'
                                        }`}
                                    >
                                        Jobs
                                    </Link>
                                    <button 
                                        onClick={handleLogout} 
                                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-all duration-200 ease-in-out ${
                                            scrolled 
                                                ? 'border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600' 
                                                : 'border-white/60 text-white hover:bg-red-500/10 hover:border-white'
                                        }`}
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button 
                            onClick={toggleMobileMenu}
                            className={`inline-flex items-center justify-center p-2 rounded-md ${
                                scrolled 
                                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                    : 'text-white hover:bg-blue-500/50'
                            }`}
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed */}
                            <svg 
                                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Icon when menu is open */}
                            <svg 
                                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor" 
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile menu, toggle based on menu state */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ease-in-out`}>
                <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${
                    scrolled ? 'bg-white' : 'bg-gradient-to-b from-blue-600/90 to-blue-700/90'
                }`}>
                    <Link 
                        to="/" 
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                            scrolled 
                                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                : 'text-white hover:bg-blue-500/50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    
                    {!loggedIn ? (
                        <>
                            <Link 
                                to="/login" 
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                        : 'text-white hover:bg-blue-500/50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    scrolled
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-white text-blue-600 hover:bg-blue-50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/jobs" 
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    scrolled 
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                                        : 'text-white hover:bg-blue-500/50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Jobs
                            </Link>
                            <button 
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }} 
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                                    scrolled 
                                        ? 'text-red-500 hover:bg-red-50' 
                                        : 'text-white hover:bg-red-500/20'
                                }`}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;