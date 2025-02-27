import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        skills: '',
        experience: '',
        education: '',
        role: 'user'
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/users/register`, formData);
            alert('Registration Successful');
            navigate('/login');
        } catch (error) {
            alert('Registration Failed: ' + error.response.data.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="text" name="skills" placeholder="Skills (comma-separated)" value={formData.skills} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="text" name="experience" placeholder="Experience" value={formData.experience} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} required className="w-full p-2 border rounded mb-2" />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
            </form>
        </div>
    );
};

export default Register;