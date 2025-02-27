import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

const JobListings = () => {
    const [jobs, setJobs] = useState([]);
    const [editingJob, setEditingJob] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [expandedJobId, setExpandedJobId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobForm, setJobForm] = useState({
        title: '',
        description: '',
        category: 'IT',
        skills_required: '',
        location: '',
        salary: '',
        job_type: 'full-time',
        experience_required: '',
        benefits: '',
        application_deadline: ''
    });
    
    // Applications modal state
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    
    // Get user information
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userRole = localStorage.getItem('role');
    const employer_id = user.id;
    
    // Determine if user is admin
    const isAdmin = userRole === 'admin';

    const fetchJobs = async () => {
        try {
            setLoading(true);
            let response;
            
            // Admin sees all jobs, employers see only their jobs
            if (isAdmin) {
                response = await axios.get(`${API_URL}/jobs`);
            } else {
                response = await axios.get(`${API_URL}/jobs/employer/${employer_id}`);
            }
            
            setJobs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [employer_id, isAdmin]);

    // Format date to YYYY-MM-DD for date input
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // Try to parse the date string
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) return '';
        
        // Format to YYYY-MM-DD
        return date.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Not specified';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await axios.delete(`${API_URL}/jobs/${id}`);
                fetchJobs();
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    const handleEdit = (job) => {
        // Create a copy of the job with properly formatted date
        const jobWithFormattedDate = {
            ...job,
            application_deadline: formatDateForInput(job.application_deadline)
        };
        
        setEditingJob(job.id);
        setJobForm(jobWithFormattedDate);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        try {
            if (editingJob) {
                await axios.put(`${API_URL}/jobs/${editingJob}`, jobForm);
            } else {
                await axios.post(`${API_URL}/jobs`, { ...jobForm, employer_id });
            }
            fetchJobs();
            setEditingJob(null);
            setJobForm({
                title: '',
                description: '',
                category: 'IT',
                skills_required: '',
                location: '',
                salary: '',
                job_type: 'full-time',
                experience_required: '',
                benefits: '',
                application_deadline: ''
            });
            setShowForm(false);
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    const toggleJobDetails = (jobId) => {
        if (expandedJobId === jobId) {
            setExpandedJobId(null);
        } else {
            setExpandedJobId(jobId);
        }
    };

    // Check if job deadline has passed
    const isJobExpired = (deadline) => {
        if (!deadline) return false;
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        
        return deadlineDate < today;
    };
    
    // Open applications modal and fetch applications
    const handleViewApplications = async (jobId) => {
        setSelectedJobId(jobId);
        setShowApplicationsModal(true);
        setLoadingApplications(true);
        
        try {
            const response = await axios.get(`${API_URL}/applications/job/${jobId}`);
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoadingApplications(false);
        }
    };
    
    // Update application status
    const handleUpdateStatus = async (applicationId, newStatus, feedback = '') => {
        try {
            await axios.put(`${API_URL}/applications/${applicationId}`, {
                status: newStatus,
                feedback,
                sendEmail: true
            });
            
            // Refresh applications list
            const response = await axios.get(`${API_URL}/applications/job/${selectedJobId}`);
            setApplications(response.data);
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-800">
                            <span className="border-b-4 border-blue-500 pb-1">
                                {isAdmin ? 'Manage All Jobs' : 'Manage Your Jobs'}
                            </span>
                        </h1>
                        <button 
                            onClick={() => setShowForm(!showForm)} 
                            className={`${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} 
                            text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300 
                            shadow-md hover:shadow-lg flex items-center`}
                        >
                            {showForm ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Close Form
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Post Job
                                </>
                            )}
                        </button>
                    </div>
                    
                    {showForm && (
                        <div className="bg-blue-100 p-6 rounded-xl shadow-inner mb-8 border border-blue-200">
                            <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b border-blue-300 pb-2">
                                {editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Job Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Senior Developer" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.title} 
                                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Category</label>
                                    <select 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                                        value={jobForm.category} 
                                        onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                                    >
                                        <option value="IT">IT</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                        <option value="Engineering">Engineering</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Location</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Kigali, Rwanda" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.location} 
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Salary (RWF)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 500000" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.salary} 
                                        onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Job Type</label>
                                    <select 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                                        value={jobForm.job_type} 
                                        onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                                    >
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Experience Required</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 2-3 years" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.experience_required} 
                                        onChange={(e) => setJobForm({ ...jobForm, experience_required: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Application Deadline</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.application_deadline} 
                                        onChange={(e) => setJobForm({ ...jobForm, application_deadline: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-blue-700">Skills Required</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. React, Node.js, MongoDB" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.skills_required} 
                                        onChange={(e) => setJobForm({ ...jobForm, skills_required: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="space-y-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-blue-700">Benefits</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Health insurance, 401k, Flexible work hours" 
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.benefits} 
                                        onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })} 
                                    />
                                </div>
                                
                                <div className="md:col-span-2 space-y-1">
                                    <label className="block text-sm font-medium text-blue-700">Job Description</label>
                                    <textarea 
                                        placeholder="Provide a detailed description of the job responsibilities and requirements..." 
                                        className="w-full p-3 border border-blue-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={jobForm.description} 
                                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg" 
                                    onClick={handleSubmit}
                                >
                                    {editingJob ? 'Update Job Listing' : 'Post Job Listing'}
                                </button>
                                <button 
                                    className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg" 
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingJob(null);
                                        setJobForm({
                                            title: '',
                                            description: '',
                                            category: 'IT',
                                            skills_required: '',
                                            location: '',
                                            salary: '',
                                            job_type: 'full-time',
                                            experience_required: '',
                                            benefits: '',
                                            application_deadline: ''
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {isAdmin ? 'All Job Listings' : 'Your Job Listings'}
                        </h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-blue-100 text-blue-700 p-6 rounded-lg text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium">No job listings found</p>
                                <p className="mt-1">Click 'Post Job' to create your first job listing.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {jobs.map(job => {
                                    const expired = isJobExpired(job.application_deadline);
                                    
                                    return (
                                        <div key={job.id} className={`bg-white border ${expired ? 'border-gray-200' : 'border-blue-200'} rounded-xl shadow-md overflow-hidden transition-all duration-300`}>
                                            {/* Job owner indicator for admin */}
                                            {isAdmin && (
                                                <div className="bg-blue-800 text-white px-4 py-1 text-sm">
                                                    Posted by: {job.employer_name || `Employer #${job.employer_id}`}
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-blue-100">
                                                <div className="mb-4 md:mb-0">
                                                    <div className="flex items-center">
                                                        <h3 className="text-xl font-bold text-blue-800">{job.title}</h3>
                                                        {expired && (
                                                            <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                                Expired
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                            {job.category}
                                                        </span>
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                            {job.job_type?.replace('-', ' ')}
                                                        </span>
                                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                            {job.location}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Applications button */}
                                                    <button 
                                                        className="flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                                                        onClick={() => handleViewApplications(job.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                                        </svg>
                                                        View Applications
                                                    </button>
                                                    
                                                    <button 
                                                        className="flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm" 
                                                        onClick={() => handleEdit(job)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    
                                                    <button 
                                                        className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm" 
                                                        onClick={() => handleDelete(job.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                    
                                                    <button 
                                                        className="flex items-center justify-center px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors shadow-sm" 
                                                        onClick={() => toggleJobDetails(job.id)}
                                                    >
                                                        {expandedJobId === job.id ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                                </svg>
                                                                Hide Details
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                                View Details
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {expandedJobId === job.id && (
                                                <div className="p-6 bg-blue-50 border-t border-blue-100">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-blue-700 mb-2">Job Description</h4>
                                                            <p className="text-gray-700 whitespace-pre-line">{job.description || 'No description provided'}</p>
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-blue-700 mb-2">Job Details</h4>
                                                                <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
                                                                    <div className="flex">
                                                                        <div className="w-1/3 text-gray-600 font-medium">Salary:</div>
                                                                        <div className="w-2/3 font-semibold">RWF {parseInt(job.salary).toLocaleString() || 'Not specified'}</div>
                                                                    </div>
                                                                    <div className="flex">
                                                                        <div className="w-1/3 text-gray-600 font-medium">Experience:</div>
                                                                        <div className="w-2/3">{job.experience_required || 'Not specified'}</div>
                                                                    </div>
                                                                    <div className="flex">
                                                                        <div className="w-1/3 text-gray-600 font-medium">Deadline:</div>
                                                                        <div className="w-2/3">
                                                                            <span className={expired ? "text-red-600 font-medium" : ""}>
                                                                                {formatDateForDisplay(job.application_deadline)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex">
                                                                        <div className="w-1/3 text-gray-600 font-medium">Posted:</div>
                                                                        <div className="w-2/3">{formatDateForDisplay(job.created_at)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-blue-700 mb-2">Required Skills</h4>
                                                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                                    {job.skills_required ? (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {job.skills_required.split(',').map((skill, index) => (
                                                                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                                                    {skill.trim()}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-gray-500">No specific skills listed</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-blue-700 mb-2">Benefits</h4>
                                                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                                    {job.benefits ? (
                                                                        <p className="text-gray-700">{job.benefits}</p>
                                                                    ) : (
                                                                        <p className="text-gray-500">No benefits listed</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Applications Modal */}
            {showApplicationsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-screen overflow-hidden flex flex-col">
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                Job Applications
                                {jobs.find(job => job.id === selectedJobId)?.title && 
                                    ` for ${jobs.find(job => job.id === selectedJobId).title}`
                                }
                            </h2>
                            <button 
                                onClick={() => setShowApplicationsModal(false)}
                                className="text-white hover:text-blue-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 flex-1">
                            {loadingApplications ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="bg-blue-50 text-blue-700 p-6 rounded-lg text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-lg font-medium">No applications received</p>
                                    <p className="mt-1">There are currently no applications for this job.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {applications.map(application => {
                                        const statusColors = {
                                            pending: "bg-yellow-100 text-yellow-800",
                                            interviewing: "bg-purple-100 text-purple-800",
                                            accepted: "bg-green-100 text-green-800",
                                            rejected: "bg-red-100 text-red-800"
                                        };
                                        
                                        return (
                                            <div key={application.id} className="border border-gray-200 rounded-lg shadow-sm">
                                                <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between bg-gray-50">
                                                    <div>
                                                        <div className="flex items-center mb-1">
                                                            <h3 className="text-lg font-semibold">{application.user_name}</h3>
                                                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[application.status] || "bg-gray-100"}`}>
                                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm">{application.user_email}</p>
                                                        <p className="text-gray-500 text-xs">Applied: {formatDateForDisplay(application.applied_at)}</p>
                                                    </div>
                                                    
                                                    <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
                                                        {application.status === 'pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(application.id, 'interviewing')}
                                                                    className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-sm font-medium"
                                                                >
                                                                    Schedule Interview
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(application.id, 'accepted')}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {application.status === 'interviewing' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(application.id, 'accepted')}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-semibold text-blue-800 mb-2">Applicant Details</h4>
                                                            <div className="bg-gray-50 p-3 rounded border">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-gray-500 text-sm">Phone:</p>
                                                                        <p className="font-medium">{application.user_phone || 'Not provided'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500 text-sm">Address:</p>
                                                                        <p className="font-medium">{application.user_address || 'Not provided'}</p>
                                                                    </div>
                                                                    <div className="sm:col-span-2">
                                                                        <p className="text-gray-500 text-sm">Experience:</p>
                                                                        <p className="font-medium">{application.user_experience || 'Not provided'}</p>
                                                                    </div>
                                                                    <div className="sm:col-span-2">
                                                                        <p className="text-gray-500 text-sm">Education:</p>
                                                                        <p className="font-medium">{application.user_education || 'Not provided'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="font-semibold text-blue-800 mb-2">Skills</h4>
                                                            <div className="bg-gray-50 p-3 rounded border">
                                                                {application.user_skills ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {application.user_skills.split(',').map((skill, index) => (
                                                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                                                {skill.trim()}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-gray-500">No skills listed</p>
                                                                )}
                                                            </div>
                                                            
                                                            {application.feedback && (
                                                                <div className="mt-4">
                                                                    <h4 className="font-semibold text-blue-800 mb-2">Feedback</h4>
                                                                    <div className="bg-gray-50 p-3 rounded border">
                                                                        <p>{application.feedback}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-gray-50 p-4 border-t flex justify-end">
                            <button 
                                onClick={() => setShowApplicationsModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobListings;