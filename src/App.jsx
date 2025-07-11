// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Signup';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import ManageJobs from './pages/ManageJobs';
import JobListingsForUsers from './pages/UsersJobs';
import EmployerDashboard from './pages/EmployerPage';
import UserApplications from './pages/AppliedJobs';
import SkillsAssessment from './pages/SkillsAssessment';
import CommunityPost from './pages/CommunityPost';
import AdminContentManagement from './pages/AdminPosts';
import AdminSkillsManagement from './pages/AdminSkills';
import EmployerTalentSearch from './pages/EmployerSkillsPage';
import Reports from './pages/Report';

const App = () => {
    const [role, setRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        const handleRoleChange = () => {
            setRole(localStorage.getItem('role'));
        };
        window.addEventListener('roleChange', handleRoleChange);
        return () => {
            window.removeEventListener('roleChange', handleRoleChange);
        };
    }, []);

    return (
        <BrowserRouter>
            {!role && <Navbar />}
            {(role === 'user') && <Navbar loggedIn />}
            <div className="flex">
  {/* Sidebar for admin, employer, microfinance, trainer, counselor, service provider, and moderator */}
  {(role === 'admin' || role === 'employer' || role === 'microfinance' || role === 'trainer' || role === 'counselor' || role === 'serviceprovider' || role === 'moderator') && role !== null && <Sidebar />}

  {/* Main content area with conditional left margin */}
  <div className={`flex-1 p-4 ${role === 'admin' || role === 'employer' || role === 'microfinance' || role === 'trainer' || role === 'counselor' || role === 'serviceprovider' || role === 'moderator' ? 'ml-64' : ''}`}>
    <Routes>
        
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/jobs" element={<JobListingsForUsers />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/employerdashboard" element={<EmployerDashboard />} />
                        <Route path="/userapplications" element={<UserApplications />} />
                        <Route path="/skillsassessment" element={<SkillsAssessment/>} />
                        <Route path="/forum" element={<CommunityPost />} />
                        <Route path="/adminforums" element={<AdminContentManagement />} />
                        <Route path="/adminskills" element={<AdminSkillsManagement />} />
                        <Route path="/skillsemployers" element={<EmployerTalentSearch />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/manage-jobs" element={<ManageJobs />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;