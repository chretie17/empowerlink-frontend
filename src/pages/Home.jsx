import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Beautiful background with subtle pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50 to-white z-0"></div>
            
            {/* Subtle decorative elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-40 left-40 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            {/* Content container with card effect */}
            <div className="relative z-10 bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 p-10 md:p-12 max-w-md w-full mx-4">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg transform transition-transform hover:scale-105 duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                </div>
                
                {/* Main content */}
                <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 mb-4">EmpowerLink</h1>
                
                <p className="text-xl text-gray-700 text-center mb-10">
                    Connecting refugees with opportunities, building bridges to a sustainable future.
                </p>
                
                {/* Call to action buttons */}
                <div className="space-y-4">
                    <Link 
                        to="/register" 
                        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5"
                    >
                        Create Account
                    </Link>
                    
                    <Link 
                        to="/login" 
                        className="block w-full bg-white hover:bg-gray-50 text-indigo-600 font-medium py-3.5 px-6 rounded-xl border border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300 text-center transform hover:-translate-y-0.5"
                    >
                        Sign In
                    </Link>
                </div>
                
                {/* Footer text */}
                <p className="mt-10 text-gray-500 text-sm text-center">
                    Empowering refugees through skills and opportunities
                </p>
            </div>
        </div>
    );
};

// Add animation styles
const animationStyles = `
@keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}
`;

// Add animation styles to document head
if (!document.getElementById('animation-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'animation-styles';
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
}

export default Home;