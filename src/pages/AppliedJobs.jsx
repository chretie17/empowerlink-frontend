import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Snackbar, Alert } from '@mui/material';

const UserApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [filter, setFilter] = useState('all');

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/applications/user/${user_id}`);
                
                // Sort applications by date (newest first)
                const sortedApplications = response.data.sort((a, b) => 
                    new Date(b.applied_at) - new Date(a.applied_at)
                );
                
                setApplications(sortedApplications);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setSnackbarMessage('Failed to load your applications');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                setLoading(false);
            }
        };

        if (user_id) {
            fetchApplications();
        } else {
            setLoading(false);
            setSnackbarMessage('You must be logged in to view applications');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
        }
    }, [user_id]);

    // Toggle expanded view for an application
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

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

    // Get status style based on application status
    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'interviewing':
                return 'bg-purple-100 text-purple-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter applications based on status
    const filteredApplications = filter === 'all' 
        ? applications 
        : applications.filter(app => app.status === filter);

    // Calculate application counts by status
    const applicationCounts = applications.reduce((counts, app) => {
        counts[app.status] = (counts[app.status] || 0) + 1;
        return counts;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-800 mb-4 md:mb-0">
                            <span className="border-b-4 border-blue-500 pb-1">My Applications</span>
                        </h1>
                        
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setFilter('all')} 
                                className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                All ({applications.length})
                            </button>
                            <button 
                                onClick={() => setFilter('pending')} 
                                className={`px-4 py-2 rounded-full ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                            >
                                Pending ({applicationCounts.pending || 0})
                            </button>
                            <button 
                                onClick={() => setFilter('interviewing')} 
                                className={`px-4 py-2 rounded-full ${filter === 'interviewing' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}
                            >
                                Interviewing ({applicationCounts.interviewing || 0})
                            </button>
                            <button 
                                onClick={() => setFilter('accepted')} 
                                className={`px-4 py-2 rounded-full ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}
                            >
                                Accepted ({applicationCounts.accepted || 0})
                            </button>
                            <button 
                                onClick={() => setFilter('rejected')} 
                                className={`px-4 py-2 rounded-full ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}`}
                            >
                                Rejected ({applicationCounts.rejected || 0})
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="bg-blue-50 text-blue-700 p-8 rounded-lg text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">No applications yet</h3>
                            <p className="text-blue-600 mb-4">
                                You haven't applied to any jobs yet.
                            </p>
                            <a 
                                href="/jobs" 
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300"
                            >
                                Browse Jobs
                            </a>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="bg-blue-50 text-blue-700 p-8 rounded-lg text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">No {filter} applications</h3>
                            <p className="text-blue-600">
                                You don't have any applications with {filter} status.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredApplications.map(application => (
                                <div 
                                    key={application.id} 
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                                >
                                    <div className="p-6 border-b">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                            <div className="mb-4 md:mb-0">
                                                <div className="flex items-center mb-2">
                                                    <h3 className="text-xl font-bold text-blue-800">{application.title}</h3>
                                                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(application.status)}`}>
                                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">
                                                    {application.employer_name} • {application.location}
                                                </p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Applied on {formatDate(application.applied_at)}
                                                </p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => toggleExpand(application.id)}
                                                className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors font-medium"
                                            >
                                                {expandedId === application.id ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                        View Details
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {expandedId === application.id && (
                                        <div className="p-6 bg-blue-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-blue-700 mb-3">Application Status</h4>
                                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                        <div className="mb-4 flex flex-col items-center">
                                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                                                                application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                application.status === 'interviewing' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {application.status === 'accepted' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                                {application.status === 'rejected' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                )}
                                                                {application.status === 'interviewing' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                                {application.status === 'pending' && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="text-lg font-medium">
                                                                {application.status === 'accepted' && 'Application Accepted'}
                                                                {application.status === 'rejected' && 'Application Rejected'}
                                                                {application.status === 'interviewing' && 'Interview Scheduled'}
                                                                {application.status === 'pending' && 'Application Under Review'}
                                                            </span>
                                                        </div>
                                                        
                                                        {application.feedback && (
                                                            <div className="mt-4">
                                                                <h5 className="font-medium text-gray-700 mb-1">Feedback from Employer:</h5>
                                                                <p className="text-gray-600 bg-gray-50 p-3 rounded border">{application.feedback}</p>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="mt-4 flex items-center">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-3">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Applied on</p>
                                                                <p className="text-sm text-gray-500">{formatDate(application.applied_at)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-lg font-semibold text-blue-700 mb-3">Job Details</h4>
                                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                        <div className="mb-2">
                                                            <span className="text-gray-500 text-sm">Job Type:</span>
                                                            <p className="font-medium">{application.job_type?.replace('-', ' ') || 'Not specified'}</p>
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className="text-gray-500 text-sm">Location:</span>
                                                            <p className="font-medium">{application.location || 'Not specified'}</p>
                                                        </div>
                                                        <div className="mb-4">
                                                            <span className="text-gray-500 text-sm">Salary:</span>
                                                            <p className="font-medium">
                                                                {application.salary ? `RWF ${parseInt(application.salary).toLocaleString()}` : 'Not specified'}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3">
                                                            <div className="flex items-center mb-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="font-medium">What to do next?</span>
                                                            </div>
                                                            
                                                            {application.status === 'pending' && (
                                                                <p className="text-sm ml-7">Your application is being reviewed. We'll notify you when there's an update.</p>
                                                            )}
                                                            
                                                            {application.status === 'interviewing' && (
                                                                <p className="text-sm ml-7">Prepare for your interview! Check your email for details about the interview schedule.</p>
                                                            )}
                                                            
                                                            {application.status === 'accepted' && (
                                                                <p className="text-sm ml-7">Congratulations! The employer will contact you about the next steps.</p>
                                                            )}
                                                            
                                                            {application.status === 'rejected' && (
                                                                <p className="text-sm ml-7">We encourage you to continue applying for other positions that match your skills.</p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                                                                {application.employer_name ? application.employer_name.charAt(0).toUpperCase() : 'E'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{application.employer_name}</p>
                                                                <p className="text-sm text-gray-500">{application.location}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={5000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserApplications;