import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

const JobListingsForUsers = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(true);
    const [expandedJobId, setExpandedJobId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        jobType: '',
        location: '',
        minSalary: '',
    });

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;
    const userSkills = user?.skills ? user.skills.toLowerCase().split(',').map(skill => skill.trim()) : [];

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/jobs/users`);
                const jobsData = response.data;
                
                // Calculate match score for each job based on skills
                const jobsWithMatchScore = jobsData.map(job => {
                    const jobSkills = job.skills_required
                        ? job.skills_required.toLowerCase().split(',').map(skill => skill.trim())
                        : [];
                    
                    // Calculate match score - how many of the user's skills match with job skills
                    const matchingSkills = userSkills.filter(skill => 
                        jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
                    );
                    
                    const matchScore = matchingSkills.length;
                    const matchPercentage = userSkills.length > 0 
                        ? Math.round((matchingSkills.length / userSkills.length) * 100) 
                        : 0;
                    
                    return {
                        ...job,
                        matchScore,
                        matchPercentage,
                        matchingSkills
                    };
                });
                
                // Sort jobs by match score (higher scores first)
                const sortedJobs = [...jobsWithMatchScore].sort((a, b) => b.matchScore - a.matchScore);
                
                setJobs(sortedJobs);
                setFilteredJobs(sortedJobs);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setSnackbarMessage('Failed to load jobs. Please try again later.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                setLoading(false);
            }
        };
        
        fetchJobs();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...jobs];
        
        // Apply search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(job => 
                job.title.toLowerCase().includes(search) ||
                job.description.toLowerCase().includes(search) ||
                job.skills_required.toLowerCase().includes(search) ||
                job.location.toLowerCase().includes(search)
            );
        }
        
        // Apply category filter
        if (filters.category) {
            result = result.filter(job => job.category === filters.category);
        }
        
        // Apply job type filter
        if (filters.jobType) {
            result = result.filter(job => job.job_type === filters.jobType);
        }
        
        // Apply location filter
        if (filters.location) {
            result = result.filter(job => 
                job.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }
        
        // Apply salary filter
        if (filters.minSalary) {
            const minSalary = parseFloat(filters.minSalary);
            result = result.filter(job => parseFloat(job.salary) >= minSalary);
        }
        
        setFilteredJobs(result);
    }, [searchTerm, filters, jobs]);

    const handleApply = async (job_id) => {
        try {
            await axios.post(`${API_URL}/applications/apply`, { user_id, job_id });
            setSnackbarMessage('Application submitted successfully!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            setSnackbarMessage('Failed to apply: ' + (error.response?.data?.message || 'Unknown error'));
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const toggleJobDetails = (jobId) => {
        setExpandedJobId(expandedJobId === jobId ? null : jobId);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            jobType: '',
            location: '',
            minSalary: '',
        });
        setSearchTerm('');
    };

    // Get unique values for filter dropdowns
    const categories = [...new Set(jobs.map(job => job.category))];
    const jobTypes = [...new Set(jobs.map(job => job.job_type))];
    const locations = [...new Set(jobs.map(job => job.location))];

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

    // Days remaining until deadline
    const getDaysRemaining = (deadlineString) => {
        if (!deadlineString) return null;
        
        const deadline = new Date(deadlineString);
        if (isNaN(deadline.getTime())) return null;
        
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6 flex-wrap">
                        <h1 className="text-3xl font-bold text-blue-800 mb-2 sm:mb-0">
                            <span className="border-b-4 border-blue-500 pb-1">Job Opportunities</span>
                        </h1>
                        
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                                Filter Jobs
                            </h2>
                            <button 
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                onClick={clearFilters}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Clear Filters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Job Type</label>
                                <select
                                    name="jobType"
                                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={filters.jobType}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Types</option>
                                    {jobTypes.map((type, index) => (
                                        <option key={index} value={type}>{type.replace('-', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Location</label>
                                <select
                                    name="location"
                                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Locations</option>
                                    {locations.map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Min Salary (RWF)</label>
                                <input
                                    type="number"
                                    name="minSalary"
                                    placeholder="Min salary"
                                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.minSalary}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Your Skills Section */}
                    {userSkills.length > 0 && (
                        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Your Skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {userSkills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-blue-700 mt-2">
                                Jobs are automatically sorted by best match to your skills
                            </p>
                        </div>
                    )}

                    {/* Loading state */}
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="bg-blue-50 text-blue-700 p-8 rounded-lg text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">No jobs found</h3>
                            <p className="text-blue-600">
                                Try adjusting your search filters or check back later for new opportunities.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredJobs.map(job => (
                                <div 
                                    key={job.id} 
                                    className={`bg-white border rounded-xl shadow-md overflow-hidden transition-all duration-300 ${job.matchScore > 0 ? 'border-blue-300' : 'border-gray-200'}`}
                                >
                                    <div className="relative">
                                        {/* Match score indicator */}
                                        {job.matchScore > 0 && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-bold">{job.matchPercentage}%</span>
                                                    <span className="ml-1 text-xs">match</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col md:flex-row justify-between p-6">
                                            <div className="mb-4 md:mb-0">
                                                <div className="flex items-center">
                                                    <h3 className="text-xl font-bold text-blue-800">{job.title}</h3>
                                                    {getDaysRemaining(job.application_deadline) !== null && getDaysRemaining(job.application_deadline) <= 7 && (
                                                        <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                            {getDaysRemaining(job.application_deadline) === 0 
                                                                ? 'Closing today!' 
                                                                : `${getDaysRemaining(job.application_deadline)} days left`
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                        {job.category}
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        {job.job_type.replace('-', ' ')}
                                                    </span>
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                        {job.location}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mt-2">
                                                    <span className="font-semibold">RWF {parseInt(job.salary).toLocaleString()}</span> • 
                                                    <span className="ml-1">Deadline: {formatDate(job.application_deadline)}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <button 
                                                    className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium" 
                                                    onClick={() => handleApply(job.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Apply Now
                                                </button>
                                                <button 
                                                    className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors shadow-sm" 
                                                    onClick={() => toggleJobDetails(job.id)}
                                                >
                                                    {expandedJobId === job.id ? (
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
                                    </div>
                                    
                                    {expandedJobId === job.id && (
                                        <div className="p-6 bg-blue-50 border-t border-blue-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-blue-700 mb-2">Job Description</h4>
                                                    <p className="text-gray-700 whitespace-pre-line">{job.description || 'No description provided'}</p>
                                                    
                                                    {/* Matching skills highlight */}
                                                    {job.matchingSkills && job.matchingSkills.length > 0 && (
                                                        <div className="mt-4">
                                                            <h5 className="text-md font-semibold text-blue-700 mb-2">Your Matching Skills</h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {job.matchingSkills.map((skill, index) => (
                                                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-blue-700 mb-2">Job Details</h4>
                                                        <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
                                                            <div className="flex">
                                                                <div className="w-1/3 text-gray-600 font-medium">Salary:</div>
                                                                <div className="w-2/3 font-semibold">RWF {parseInt(job.salary).toLocaleString()}</div>
                                                            </div>
                                                            <div className="flex">
                                                                <div className="w-1/3 text-gray-600 font-medium">Experience:</div>
                                                                <div className="w-2/3">{job.experience_required || 'Not specified'}</div>
                                                            </div>
                                                            <div className="flex">
                                                                <div className="w-1/3 text-gray-600 font-medium">Deadline:</div>
                                                                <div className="w-2/3">{formatDate(job.application_deadline)}</div>
                                                            </div>
                                                            <div className="flex">
                                                                <div className="w-1/3 text-gray-600 font-medium">Posted:</div>
                                                                <div className="w-2/3">{formatDate(job.created_at)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-blue-700 mb-2">Required Skills</h4>
                                                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                                                            {job.skills_required ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {job.skills_required.split(',').map((skill, index) => (
                                                                        <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                                                                            userSkills.some(userSkill => 
                                                                                userSkill.includes(skill.trim().toLowerCase()) || 
                                                                                skill.trim().toLowerCase().includes(userSkill)
                                                                            ) 
                                                                            ? 'bg-green-100 text-green-700' 
                                                                            : 'bg-blue-100 text-blue-700'
                                                                        }`}>
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
                                                    
                                                    <button 
                                                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium mt-4" 
                                                        onClick={() => handleApply(job.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Apply for this Position
                                                    </button>
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

export default JobListingsForUsers;