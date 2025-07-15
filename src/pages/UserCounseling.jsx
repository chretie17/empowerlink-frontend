import React, { useState, useEffect } from 'react';
import { Calendar, User, Target, Briefcase, FileText, BookOpen, Clock, TrendingUp, MapPin, DollarSign, Star } from 'lucide-react';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [sessions, setSessions] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [goals, setGoals] = useState([]);
    const [applications, setApplications] = useState([]);
    const [jobMatches, setJobMatches] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;

    const API_BASE = 'http://localhost:5000/api/counselor';

    // Fetch functions
    const fetchSessions = async () => {
        if (!user_id) return;
        try {
            const response = await fetch(`${API_BASE}/sessions/user/${user_id}`);
            setSessions(await response.json());
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchAssessments = async () => {
        if (!user_id) return;
        try {
            const response = await fetch(`${API_BASE}/assessments/user/${user_id}`);
            setAssessments(await response.json());
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    const fetchGoals = async () => {
        if (!user_id) return;
        try {
            const response = await fetch(`${API_BASE}/goals/user/${user_id}`);
            setGoals(await response.json());
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const fetchApplications = async () => {
        if (!user_id) return;
        try {
            const response = await fetch(`${API_BASE}/applications/user/${user_id}`);
            setApplications(await response.json());
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const fetchJobMatches = async () => {
        if (!user_id) return;
        try {
            const response = await fetch(`${API_BASE}/matches/user/${user_id}`);
            setJobMatches(await response.json());
        } catch (error) {
            console.error('Error fetching job matches:', error);
        }
    };

    const fetchResources = async () => {
        try {
            const response = await fetch(`${API_BASE}/resources`);
            setResources(await response.json());
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

   const generateJobMatches = async () => {
    setLoading(true);
    if (!user_id) return;
    
    try {
        const response = await fetch(`${API_BASE}/matches/generate/${user_id}`, { 
            method: 'POST' 
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(`${data.message} (${data.matches_count} matches found)`);
            fetchJobMatches();
        } else {
            // Handle error responses
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Failed to generate matches'}`);
        }
    } catch (error) {
        console.error('Error generating matches:', error);
        alert('Network error occurred while generating matches');
    }
    setLoading(false);
};

   const applyForJob = async (jobId) => {
    if (!user_id) return;
    
    try {
        const response = await fetch(`${API_BASE}/applications/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, job_id: jobId })
        });
        
        if (response.ok) {
            const data = await response.json();
            alert(data.message); // Shows "Job application submitted successfully!"
            fetchApplications();
        } else {
            // Handle error responses (like duplicate applications)
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error applying for job:', error);
        alert('Network error occurred while applying for job');
    }
};
    useEffect(() => {
        if (user_id) {
            fetchSessions();
            fetchAssessments();
            fetchGoals();
            fetchApplications();
            fetchJobMatches();
            fetchResources();
        }
    }, [user_id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'accepted': return 'text-green-600';
            case 'rejected': return 'text-red-600';
            case 'cancelled': return 'text-red-600';
            case 'pending': return 'text-yellow-600';
            case 'scheduled': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Total Sessions</h3>
                        <p className="text-3xl font-bold">{sessions.length}</p>
                    </div>
                    <Calendar className="w-10 h-10 opacity-80" />
                </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Active Goals</h3>
                        <p className="text-3xl font-bold">{goals.filter(g => g.status === 'active').length}</p>
                    </div>
                    <Target className="w-10 h-10 opacity-80" />
                </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">AI Job Matches</h3>
                        <p className="text-3xl font-bold">{jobMatches.length}</p>
                    </div>
                    <Briefcase className="w-10 h-10 opacity-80" />
                </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Applications</h3>
                        <p className="text-3xl font-bold">{applications.length}</p>
                    </div>
                    <FileText className="w-10 h-10 opacity-80" />
                </div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Assessments</h3>
                        <p className="text-3xl font-bold">{assessments.length}</p>
                    </div>
                    <FileText className="w-10 h-10 opacity-80" />
                </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Resources</h3>
                        <p className="text-3xl font-bold">{resources.length}</p>
                    </div>
                    <BookOpen className="w-10 h-10 opacity-80" />
                </div>
            </div>
        </div>
    );

    const renderSessions = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Counseling Sessions</h2>
            {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No sessions scheduled yet</p>
                </div>
            ) : (
                sessions.map(session => (
                    <div key={session.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{session.session_type.replace('_', ' ').toUpperCase()}</h3>
                                <p className="text-gray-600 mb-2">with {session.counselor_name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(session.session_date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {session.duration_minutes} min
                                    </span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                                {session.status}
                            </span>
                        </div>
                        {session.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm">{session.notes}</p>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    const renderAssessments = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Career Assessments</h2>
            {assessments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No assessments completed yet</p>
                </div>
            ) : (
                assessments.map(assessment => (
                    <div key={assessment.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg">{assessment.assessment_type.replace('_', ' ').toUpperCase()}</h3>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{assessment.score}/100</div>
                                <div className="text-sm text-gray-500">Score</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Completed on {new Date(assessment.completed_at).toLocaleDateString()}</p>
                        {assessment.counselor_name && (
                            <p className="text-sm text-gray-600 mb-4">Conducted by {assessment.counselor_name}</p>
                        )}
                        {assessment.recommendations && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Recommendations:</h4>
                                <p className="text-blue-800 text-sm">{assessment.recommendations}</p>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    const renderGoals = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Career Goals</h2>
            {goals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No career goals set yet</p>
                </div>
            ) : (
                goals.map(goal => (
                    <div key={goal.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{goal.goal_title}</h3>
                                <p className="text-gray-600">{goal.target_position} in {goal.target_industry}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                                {goal.priority}
                            </span>
                        </div>
                        <p className="text-gray-700 mb-4">{goal.goal_description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span>Timeline: {goal.timeline_months} months</span>
                            <span>Progress: {goal.progress_percentage || 0}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${goal.progress_percentage || 0}%` }}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderJobMatches = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">AI Job Matches</h2>
                <button 
                    onClick={generateJobMatches}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <TrendingUp className="w-4 h-4" />
                    {loading ? 'Generating...' : 'Generate Matches'}
                </button>
            </div>
            {jobMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No job matches found. Click "Generate Matches" to find suitable jobs.</p>
                </div>
            ) : (
                jobMatches.map(match => (
                    <div key={match.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{match.title}</h3>
                                <p className="text-gray-600">{match.employer_name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {match.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {match.salary}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-green-600 mb-2">
                                    <Star className="w-4 h-4" />
                                    <span className="font-bold">{match.match_score}%</span>
                                </div>
                                <span className="text-sm text-gray-500">Match Score</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-green-700 mb-2">
                                <strong>Matching Skills:</strong> {match.matching_skills?.join(', ') || 'None'}
                            </p>
                            <p className="text-sm text-orange-700">
                                <strong>Skill Gaps:</strong> {match.skill_gaps?.join(', ') || 'None'}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{match.job_type}</span>
                            <button 
                                onClick={() => applyForJob(match.job_id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderApplications = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Job Applications</h2>
            {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No job applications submitted yet</p>
                </div>
            ) : (
                applications.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{app.title}</h3>
                                <p className="text-gray-600">{app.employer_name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {app.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {app.salary}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                {app.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                        {app.feedback && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">{app.feedback}</p>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    const renderResources = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Available Resources</h2>
            {resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No resources available</p>
                </div>
            ) : (
                resources.map(resource => (
                    <div key={resource.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{resource.title}</h3>
                                <p className="text-gray-600 mb-2">{resource.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{resource.resource_type}</span>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{resource.category}</span>
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{resource.target_audience}</span>
                                </div>
                            </div>
                            {resource.url && (
                                <a 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    View Resource
                                </a>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (!user_id) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-2">Please Log In</h2>
                    <p className="text-gray-500">You need to be logged in to access your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-16">
            <header className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Career Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.name || 'User'}!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Logged in as</p>
                                <p className="font-medium text-gray-900">{user.name}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow">
                        {[
                            { key: 'overview', label: 'Overview', icon: TrendingUp },
                            { key: 'sessions', label: 'Sessions', icon: Calendar },
                            { key: 'assessments', label: 'Assessments', icon: FileText },
                            { key: 'goals', label: 'Goals', icon: Target },
                            { key: 'matches', label: 'AI Job Matches', icon: Briefcase },
                            { key: 'applications', label: 'Applications', icon: FileText },
                            { key: 'resources', label: 'Resources', icon: BookOpen }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === tab.key
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'sessions' && renderSessions()}
                    {activeTab === 'assessments' && renderAssessments()}
                    {activeTab === 'goals' && renderGoals()}
                    {activeTab === 'matches' && renderJobMatches()}
                    {activeTab === 'applications' && renderApplications()}
                    {activeTab === 'resources' && renderResources()}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;