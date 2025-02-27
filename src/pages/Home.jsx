import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Welcome to EmpowerLink</h1>
            <p className="text-lg text-gray-600 mb-6">Connecting opportunities with skills.</p>
            <div className="flex gap-4">
                <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</Link>
                <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded">Register</Link>
            </div>
        </div>
    );
};

export default Home;