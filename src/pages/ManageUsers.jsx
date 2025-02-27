// ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [userForm, setUserForm] = useState({ username: '', name: '', email: '', phone: '', address: '', skills: '', experience: '', education: '', role: 'user', password: '' });

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setUserForm({ ...user, password: '' }); // Don't overwrite password
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                const updatedData = { ...userForm };
                if (!updatedData.password) delete updatedData.password; // Remove password if empty
                await axios.put(`${API_URL}/users/${editingUser}`, updatedData);
            } else {
                await axios.post(`${API_URL}/users/register`, userForm);
            }
            fetchUsers();
            setEditingUser(null);
            setUserForm({ username: '', name: '', email: '', phone: '', address: '', skills: '', experience: '', education: '', role: 'user', password: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Manage Users</h1>
            <button onClick={() => setShowForm(!showForm)} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
                {showForm ? 'Close Form' : 'Add User'}
            </button>
            {showForm && (
                <div className="p-6 bg-white rounded shadow-lg mb-6">
                    <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Username" className="border p-2 rounded" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
                        <input type="text" placeholder="Name" className="border p-2 rounded" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                        <input type="email" placeholder="Email" className="border p-2 rounded" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                        <input type="text" placeholder="Phone" className="border p-2 rounded" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                        <input type="text" placeholder="Address" className="border p-2 rounded" value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} />
                        <input type="text" placeholder="Skills" className="border p-2 rounded" value={userForm.skills} onChange={(e) => setUserForm({ ...userForm, skills: e.target.value })} />
                        <input type="text" placeholder="Experience" className="border p-2 rounded" value={userForm.experience} onChange={(e) => setUserForm({ ...userForm, experience: e.target.value })} />
                        <input type="text" placeholder="Education" className="border p-2 rounded" value={userForm.education} onChange={(e) => setUserForm({ ...userForm, education: e.target.value })} />
                        <select className="border p-2 rounded" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="employer">Employer</option>
                        </select>
                        <input type="password" placeholder="Password (Leave blank to keep existing)" className="border p-2 rounded" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={handleSubmit}>{editingUser ? 'Update' : 'Add'} User</button>
                </div>
            )}
            <table className="w-full border-collapse border border-gray-300 shadow-lg">
                <thead>
                    <tr className="bg-gray-200 text-gray-700">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Username</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="text-center hover:bg-gray-100">
                            <td className="border p-2">{user.id}</td>
                            <td className="border p-2">{user.username}</td>
                            <td className="border p-2">{user.name}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.role}</td>
                            <td className="border p-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEdit(user)}>Edit</button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
