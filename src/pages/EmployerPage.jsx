import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

const EmployerDashboard = () => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobApplications, setJobApplications] = useState([]);
    const [expandedApplicationId, setExpandedApplicationId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [feedbackModal, setFeedbackModal] = useState({ show: false, applicationId: null, feedback: '', status: '' });
    
    const employer = JSON.parse(localStorage.getItem('user')) || {};
    const employer_id = employer.id;

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/jobs/employer/${employer_id}`);
            setJobs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/applications/employer/${employer_id}`);
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setLoading(false);
        }
    };

    const fetchJobApplications = async (jobId) => {
        try {
            const response = await axios.get(`${API_URL}/applications/job/${jobId}`);
            setJobApplications(response.data);
            setSelectedJob(jobs.find(job => job.id === jobId));
        } catch (error) {
            console.error('Error fetching job applications:', error);
        }
    };

    const updateApplicationStatus = async (applicationId, status, feedback = '') => {
        try {
            await axios.put(`${API_URL}/applications/${applicationId}`, { 
                status,
                feedback,
                sendEmail: true
            });
            
            // Update local state
            if (selectedJob) {
                setJobApplications(prev => 
                    prev.map(app => 
                        app.id === applicationId ? { ...app, status, feedback } : app
                    )
                );
            }
            
            setApplications(prev => 
                prev.map(app => 
                    app.id === applicationId ? { ...app, status, feedback } : app
                )
            );
            
            setNotification({
                show: true,
                message: `Application marked as ${status}`,
                type: 'success'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            
        } catch (error) {
            console.error('Error updating application status:', error);
            setNotification({
                show: true,
                message: 'Failed to update application status',
                type: 'error'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    const handleFeedbackSubmit = () => {
        updateApplicationStatus(
            feedbackModal.applicationId, 
            feedbackModal.status, 
            feedbackModal.feedback
        );
        setFeedbackModal({ show: false, applicationId: null, feedback: '', status: '' });
    };

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [employer_id]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get application status class
    const getStatusClass = (status) => {
        switch(status.toLowerCase()) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'interviewing':
                return 'bg-purple-100 text-purple-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    // Check if job deadline has passed
    const isJobExpired = (deadline) => {
        if (!deadline) return false;
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        
        return deadlineDate < today;
    };

    return (
        <div className="min-h-screen bg-blue-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Dashboard Header */}
                    <div className="bg-blue-600 p-6 text-white">
                        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
                        <p className="mt-1 text-blue-100">Manage your job listings and applications</p>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="bg-blue-500 px-6">
                        <div className="flex space-x-1">
                            <button 
                                className={`py-4 px-6 text-sm font-medium rounded-t-lg transition-colors ${
                                    activeTab === 'jobs'
                                        ? 'bg-white text-blue-700' 
                                        : 'text-white hover:bg-blue-400'
                                }`}
                                onClick={() => {
                                    setActiveTab('jobs');
                                    setSelectedJob(null);
                                }}
                            >
                                My Job Listings
                            </button>
                            <button 
                                className={`py-4 px-6 text-sm font-medium rounded-t-lg transition-colors ${
                                    activeTab === 'applications'
                                        ? 'bg-white text-blue-700' 
                                        : 'text-white hover:bg-blue-400'
                                }`}
                                onClick={() => {
                                    setActiveTab('applications');
                                    setSelectedJob(null);
                                }}
                            >
                                All Applications
                            </button>
                        </div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="p-6">
                        {/* Job Listings Tab */}
                        {activeTab === 'jobs' && !selectedJob && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Your Job Listings</h2>
                                    <a 
                                        href="/jobs/create" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                                    >
                                        Post New Job
                                    </a>
                                </div>
                                
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="text-center py-12 bg-blue-50 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-gray-800">No job listings</h3>
                                        <p className="text-gray-600 mt-1">Create your first job posting to get started</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 text-left">
                                                    <th className="p-4 font-semibold text-gray-700">Job Title</th>
                                                    <th className="p-4 font-semibold text-gray-700">Location</th>
                                                    <th className="p-4 font-semibold text-gray-700">Applications</th>
                                                    <th className="p-4 font-semibold text-gray-700">Deadline</th>
                                                    <th className="p-4 font-semibold text-gray-700">Status</th>
                                                    <th className="p-4 font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {jobs.map(job => {
                                                    const jobApplicationCount = applications.filter(app => app.job_id === job.id).length;
                                                    const expired = isJobExpired(job.application_deadline);
                                                    
                                                    return (
                                                        <tr key={job.id} className="hover:bg-gray-50">
                                                            <td className="p-4 text-gray-800 font-medium">{job.title}</td>
                                                            <td className="p-4 text-gray-600">{job.location}</td>
                                                            <td className="p-4">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {jobApplicationCount} applications
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-gray-600">
                                                                {formatDate(job.application_deadline)}
                                                            </td>
                                                            <td className="p-4">
                                                                {expired ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Closed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => fetchJobApplications(job.id)}
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        View Applications
                                                                    </button>
                                                                    
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Job Applications for a specific job */}
                        {activeTab === 'jobs' && selectedJob && (
                            <div>
                                <div className="flex items-center mb-6">
                                    <button 
                                        onClick={() => setSelectedJob(null)}
                                        className="mr-3 text-blue-600 hover:text-blue-800"
                                    >
                                        ← Back to Jobs
                                    </button>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Applications for: {selectedJob.title}
                                    </h2>
                                </div>
                                
                                {jobApplications.length === 0 ? (
                                    <div className="text-center py-12 bg-blue-50 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-gray-800">No applications yet</h3>
                                        <p className="text-gray-600 mt-1">There are currently no applications for this job</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {jobApplications.map(application => (
                                            <div key={application.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800">{application.user_name}</h3>
                                                        <p className="text-gray-600">{application.user_email}</p>
                                                    </div>
                                                    <div className="flex items-center mt-2 sm:mt-0">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getStatusClass(application.status)}`}>
                                                            {application.status}
                                                        </span>
                                                        <span className="text-gray-500 text-sm">
                                                            Applied: {formatDate(application.applied_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 flex flex-col sm:flex-row">
                                                    <button
                                                        onClick={() => setExpandedApplicationId(expandedApplicationId === application.id ? null : application.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm mb-3 sm:mb-0 sm:mr-4"
                                                    >
                                                        {expandedApplicationId === application.id ? 'Hide Details' : 'View Details'}
                                                    </button>
                                                    
                                                    <div className="flex space-x-2 sm:ml-auto">
                                                        {application.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => setFeedbackModal({
                                                                        show: true,
                                                                        applicationId: application.id,
                                                                        feedback: '',
                                                                        status: 'interviewing'
                                                                    })}
                                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm"
                                                                >
                                                                    Schedule Interview
                                                                </button>
                                                                <button
                                                                    onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => setFeedbackModal({
                                                                        show: true,
                                                                        applicationId: application.id,
                                                                        feedback: '',
                                                                        status: 'rejected'
                                                                    })}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {application.status === 'interviewing' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => setFeedbackModal({
                                                                        show: true,
                                                                        applicationId: application.id,
                                                                        feedback: '',
                                                                        status: 'rejected'
                                                                    })}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {(application.status === 'accepted' || application.status === 'rejected') && (
                                                            <button
                                                                onClick={() => setFeedbackModal({
                                                                    show: true,
                                                                    applicationId: application.id,
                                                                    feedback: application.feedback || '',
                                                                    status: application.status
                                                                })}
                                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                                                            >
                                                                {application.feedback ? 'Edit Feedback' : 'Add Feedback'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {expandedApplicationId === application.id && (
                                                    <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Applicant Information</h4>
                                                                <div className="bg-white p-3 rounded border">
                                                                    <div className="mb-2">
                                                                        <span className="text-gray-500 text-sm">Phone:</span>
                                                                        <p className="text-gray-800">{application.user_phone || 'Not provided'}</p>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <span className="text-gray-500 text-sm">Address:</span>
                                                                        <p className="text-gray-800">{application.user_address || 'Not provided'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-sm">Experience:</span>
                                                                        <p className="text-gray-800">{application.user_experience || 'Not provided'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills & Education</h4>
                                                                <div className="bg-white p-3 rounded border">
                                                                    <div className="mb-2">
                                                                        <span className="text-gray-500 text-sm">Skills:</span>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {application.user_skills ? (
                                                                                application.user_skills.split(',').map((skill, index) => (
                                                                                    <span 
                                                                                        key={index} 
                                                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                                                                    >
                                                                                        {skill.trim()}
                                                                                    </span>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-gray-500 text-sm">No skills listed</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-sm">Education:</span>
                                                                        <p className="text-gray-800">{application.user_education || 'Not provided'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {application.feedback && (
                                                                <div className="md:col-span-2">
                                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback</h4>
                                                                    <div className="bg-white p-3 rounded border">
                                                                        <p className="text-gray-800">{application.feedback}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* All Applications Tab */}
                        {activeTab === 'applications' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6">All Applications</h2>
                                
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : applications.length === 0 ? (
                                    <div className="text-center py-12 bg-blue-50 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-gray-800">No applications yet</h3>
                                        <p className="text-gray-600 mt-1">There are currently no applications for your job listings</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 text-left">
                                                    <th className="p-4 font-semibold text-gray-700">Applicant</th>
                                                    <th className="p-4 font-semibold text-gray-700">Job Position</th>
                                                    <th className="p-4 font-semibold text-gray-700">Status</th>
                                                    <th className="p-4 font-semibold text-gray-700">Applied On</th>
                                                    <th className="p-4 font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {applications.map(application => (
                                                    <tr key={application.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <div>
                                                                <div className="font-medium text-gray-800">{application.user_name}</div>
                                                                <div className="text-gray-500 text-sm">{application.user_email}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-gray-800">{application.job_title}</td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(application.status)}`}>
                                                                {application.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-gray-600">{formatDate(application.applied_at)}</td>
                                                        <td className="p-4">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const jobId = application.job_id;
                                                                        fetchJobApplications(jobId);
                                                                        setActiveTab('jobs');
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
                    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}>
                    {notification.message}
                </div>
            )}
            
            {/* Feedback Modal */}
            {feedbackModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
                        <div className="bg-blue-600 px-4 py-3 text-white">
                            <h3 className="text-lg font-medium">
                                {feedbackModal.status === 'rejected' ? 'Rejection Feedback' : 
                                 feedbackModal.status === 'interviewing' ? 'Interview Details' : 
                                 'Application Feedback'}
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {feedbackModal.status === 'rejected' ? 'Provide feedback to the applicant (optional):' : 
                                     feedbackModal.status === 'interviewing' ? 'Interview details:' : 
                                     'Feedback:'}
                                </label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                    placeholder={
                                        feedbackModal.status === 'rejected' 
                                            ? "Why didn't this candidate match your requirements?" 
                                            : feedbackModal.status === 'interviewing'
                                            ? "Include interview details (date, time, location or link)"
                                            : "Provide feedback to the applicant"
                                    }
                                    value={feedbackModal.feedback}
                                    onChange={(e) => setFeedbackModal({...feedbackModal, feedback: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    onClick={() => setFeedbackModal({ show: false, applicationId: null, feedback: '', status: '' })}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-md text-white ${
                                        feedbackModal.status === 'rejected' 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                    onClick={handleFeedbackSubmit}
                                >
                                    {feedbackModal.status === 'rejected' ? 'Reject Application' : 
                                     feedbackModal.status === 'interviewing' ? 'Schedule Interview' : 'Send Feedback'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerDashboard;