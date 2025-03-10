import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../api';
import axios from 'axios';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/users/login`, { usernameOrEmail, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('roleChange'));
            
            displayMessage('Login successful. Welcome back!', 'success');
            
            setTimeout(() => {
                if (response.data.role === 'admin' || response.data.role === 'employer') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }, 1500);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
            displayMessage(errorMsg, 'error');
            setIsLoading(false);
        }
    };

    const displayMessage = (text, type = 'success') => {
        setShowMessage({ visible: true, text, type });
        setTimeout(() => {
            setShowMessage({ visible: false, text: '', type: 'success' });
        }, 4000);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
            {/* Left side - EmpowerLink description */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.5" />
                        <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>
                
                <div className="relative z-10 max-w-md">
                    <div className="flex items-center mb-8 space-x-3">
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">EmpowerLink</h1>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-6">Building bridges for refugees</h2>
                    
                    <p className="text-white/80 mb-12 leading-relaxed">
                        EmpowerLink connects refugees with employment opportunities and skill development resources, 
                        helping them build sustainable careers and integrate into their new communities.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-blue-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Job Matching</h3>
                            <p className="text-white/70">Connect with employers looking for your skills</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-blue-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Skill Development</h3>
                            <p className="text-white/70">Access training to enhance your employability</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                            <div className="text-blue-200 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-lg mb-1">Community Support</h3>
                            <p className="text-white/70">Connect with mentors and support networks</p>
                        </div>
                       
                    </div>
                </div>
            </div>
            
            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Mobile-only logo */}
                    <div className="flex items-center mb-8 lg:hidden">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">EmpowerLink</h1>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="px-8 pt-8 pb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
                            <p className="text-gray-500 mb-8">Sign in to continue your journey</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username or Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="usernameOrEmail"
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your username or email"
                                            value={usernameOrEmail}
                                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                   
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-white font-medium text-sm
                                        ${isLoading 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                            </svg>
                                            Sign in
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                        
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account? 
                                <Link to="/register" className="ml-1 font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center space-x-4">
                        <button className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </button>
                        <button className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all">
                            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </button>
                        <button className="p-2 rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all">
                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.2125 5.65605C21.4491 5.99375 20.6395 6.21555 19.8106 6.31411C20.6839 5.79132 21.3374 4.9689 21.6493 4.00005C20.8287 4.48761 19.9305 4.83077 18.9938 5.01461C18.2031 4.17106 17.098 3.69303 15.9418 3.69434C13.6326 3.69434 11.7597 5.56661 11.7597 7.87683C11.7597 8.20458 11.7973 8.52242 11.8676 8.82909C8.39047 8.65404 5.31007 6.99005 3.24678 4.45941C2.87529 5.09767 2.68005 5.82318 2.68104 6.56167C2.68104 8.01259 3.4196 9.29324 4.54149 10.043C3.87737 10.022 3.22788 9.84264 2.64718 9.51973C2.64654 9.5373 2.64654 9.55487 2.64654 9.57148C2.64654 11.5984 4.08819 13.2892 6.00199 13.6731C5.6428 13.7703 5.27232 13.8194 4.90022 13.819C4.62997 13.819 4.36891 13.7941 4.11461 13.7453C4.64516 15.4065 6.18851 16.6159 8.0196 16.6491C6.53813 17.8118 4.70869 18.4426 2.82543 18.4399C2.49212 18.4402 2.15909 18.4205 1.82812 18.3811C3.74004 19.6102 5.96552 20.264 8.23842 20.2611C15.9316 20.2611 20.138 13.8882 20.138 8.36111C20.138 8.1803 20.1336 7.99886 20.1256 7.81997C20.9443 7.22845 21.651 6.49567 22.2125 5.65605Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="mt-4 text-center">
                        <span className="text-xs text-gray-500">
                            By signing in, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Message Snackbar */}
            {showMessage.visible && (
                <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-xl max-w-xs overflow-hidden ${
                    showMessage.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                } transition-all duration-300 animate-fade-in`}>
                    <div className="flex items-center px-4 py-3">
                        <svg className="h-6 w-6 text-white mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {showMessage.type === 'error' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            )}
                        </svg>
                        <p className="text-white pr-2">{showMessage.text}</p>
                    </div>
                    <div className="h-1 bg-white/20">
                        <div className="h-full bg-white/40 animate-shrink"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add animations styles
if (!document.getElementById('login-animations')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "login-animations";
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
        }
        .animate-shrink {
            animation: shrink 4s linear forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(styleSheet);
}

export default Login;