import React, { useState, useEffect } from 'react';

const CounselorDashboard = () => {
    const [activeTab, setActiveTab] = useState('sessions');
    const [counselorId, setCounselorId] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [goals, setGoals] = useState([]);
    const [applications, setApplications] = useState([]);
    const [resources, setResources] = useState([]);
    const [jobMatches, setJobMatches] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(false);

    // Form states
    const [newSession, setNewSession] = useState({
        user_id: '', session_type: 'career_assessment', session_date: '', duration_minutes: 60
    });
    const [newAssessment, setNewAssessment] = useState({
        user_id: '', assessment_type: 'skills', score: 0, recommendations: ''
    });
    const [newGoal, setNewGoal] = useState({
        user_id: '', goal_title: '', goal_description: '', target_position: '', target_industry: '', timeline_months: 6, priority: 'medium'
    });
    const [newResource, setNewResource] = useState({
        title: '', description: '', resource_type: 'article', url: '', category: '', target_audience: 'refugees'
    });

    const API_BASE = 'http://localhost:5000/api/counselor';

    // Fetch functions
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/sessions/counselor/${counselorId}`);
            setSessions(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            const data = await response.json();
            setUsers(data.filter(user => user.role === 'user'));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAssessments = async () => {
        if (!selectedUserId) return;
        try {
            const response = await fetch(`${API_BASE}/assessments/user/${selectedUserId}`);
            setAssessments(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchGoals = async () => {
        if (!selectedUserId) return;
        try {
            const response = await fetch(`${API_BASE}/goals/user/${selectedUserId}`);
            setGoals(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchApplications = async () => {
        if (!selectedUserId) return;
        try {
            const response = await fetch(`${API_BASE}/applications/user/${selectedUserId}`);
            setApplications(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchJobMatches = async () => {
        if (!selectedUserId) return;
        try {
            const response = await fetch(`${API_BASE}/matches/user/${selectedUserId}`);
            setJobMatches(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchResources = async () => {
        try {
            const response = await fetch(`${API_BASE}/resources`);
            setResources(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchCounselors = async () => {
        try {
            const response = await fetch(`${API_BASE}/counselors`);
            setCounselors(await response.json());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Create functions
    const createSession = async () => {
        try {
            const response = await fetch(`${API_BASE}/sessions/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newSession, counselor_id: counselorId })
            });
            if (response.ok) {
                alert('Session scheduled successfully!');
                setNewSession({ user_id: '', session_type: 'career_assessment', session_date: '', duration_minutes: 60 });
                fetchSessions();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createAssessment = async () => {
        try {
            const response = await fetch(`${API_BASE}/assessments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAssessment, counselor_id: counselorId, questions: [], answers: [], results: {} })
            });
            if (response.ok) {
                alert('Assessment created successfully!');
                setNewAssessment({ user_id: '', assessment_type: 'skills', score: 0, recommendations: '' });
                fetchAssessments();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createGoal = async () => {
        try {
            const response = await fetch(`${API_BASE}/goals/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newGoal, counselor_id: counselorId })
            });
            if (response.ok) {
                alert('Goal created successfully!');
                setNewGoal({ user_id: '', goal_title: '', goal_description: '', target_position: '', target_industry: '', timeline_months: 6, priority: 'medium' });
                fetchGoals();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const createResource = async () => {
        try {
            const response = await fetch(`${API_BASE}/resources/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newResource, created_by: counselorId })
            });
            if (response.ok) {
                alert('Resource created successfully!');
                setNewResource({ title: '', description: '', resource_type: 'article', url: '', category: '', target_audience: 'refugees' });
                fetchResources();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const generateJobMatches = async () => {
        if (!selectedUserId) return;
        try {
            const response = await fetch(`${API_BASE}/matches/generate/${selectedUserId}`, { method: 'POST' });
            if (response.ok) {
                alert('Job matches generated successfully!');
                fetchJobMatches();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateSessionStatus = async (sessionId, status) => {
        try {
            const response = await fetch(`${API_BASE}/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, notes: `Session ${status}` })
            });
            if (response.ok) {
                alert('Session updated successfully!');
                fetchSessions();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateApplicationStatus = async (appId, status) => {
        try {
            const response = await fetch(`${API_BASE}/applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, feedback: `Application ${status}` })
            });
            if (response.ok) {
                alert('Application updated successfully!');
                fetchApplications();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchUsers();
        fetchResources();
        fetchCounselors();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchAssessments();
            fetchGoals();
            fetchApplications();
            fetchJobMatches();
        }
    }, [selectedUserId]);

    const renderSessions = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Schedule New Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={newSession.user_id} onChange={(e) => setNewSession({...newSession, user_id: e.target.value})} className="border rounded px-3 py-2">
                        <option value="">Select User</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <select value={newSession.session_type} onChange={(e) => setNewSession({...newSession, session_type: e.target.value})} className="border rounded px-3 py-2">
                        <option value="career_assessment">Career Assessment</option>
                        <option value="job_search">Job Search</option>
                        <option value="interview_prep">Interview Prep</option>
                        <option value="skill_development">Skill Development</option>
                        <option value="goal_setting">Goal Setting</option>
                    </select>
                    <input type="datetime-local" value={newSession.session_date} onChange={(e) => setNewSession({...newSession, session_date: e.target.value})} className="border rounded px-3 py-2" />
                    <input type="number" value={newSession.duration_minutes} onChange={(e) => setNewSession({...newSession, duration_minutes: e.target.value})} placeholder="Duration (minutes)" className="border rounded px-3 py-2" />
                </div>
                <button onClick={createSession} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Schedule Session</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">My Sessions</h3>
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3">
                        {sessions.map(session => (
                            <div key={session.id} className="border rounded p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium">{session.user_name}</h4>
                                    <p className="text-sm text-gray-600">{session.session_type} - {new Date(session.session_date).toLocaleString()}</p>
                                    <p className="text-sm">Status: <span className={`font-medium ${session.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{session.status}</span></p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => updateSessionStatus(session.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Complete</button>
                                    <button onClick={() => updateSessionStatus(session.id, 'cancelled')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Cancel</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderAssessments = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Create Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={newAssessment.user_id} onChange={(e) => setNewAssessment({...newAssessment, user_id: e.target.value})} className="border rounded px-3 py-2">
                        <option value="">Select User</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <select value={newAssessment.assessment_type} onChange={(e) => setNewAssessment({...newAssessment, assessment_type: e.target.value})} className="border rounded px-3 py-2">
                        <option value="skills">Skills Assessment</option>
                        <option value="interests">Interests Assessment</option>
                        <option value="personality">Personality Assessment</option>
                        <option value="values">Values Assessment</option>
                    </select>
                    <input type="number" value={newAssessment.score} onChange={(e) => setNewAssessment({...newAssessment, score: e.target.value})} placeholder="Score (0-100)" className="border rounded px-3 py-2" />
                    <textarea value={newAssessment.recommendations} onChange={(e) => setNewAssessment({...newAssessment, recommendations: e.target.value})} placeholder="Recommendations" className="border rounded px-3 py-2" rows="2" />
                </div>
                <button onClick={createAssessment} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Create Assessment</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Assessments</h3>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="border rounded px-3 py-2 mb-4">
                    <option value="">Select User to View Assessments</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <div className="space-y-3">
                    {assessments.map(assessment => (
                        <div key={assessment.id} className="border rounded p-4">
                            <h4 className="font-medium">{assessment.assessment_type}</h4>
                            <p className="text-sm text-gray-600">Score: {assessment.score}/100</p>
                            <p className="text-sm text-gray-600">Recommendations: {assessment.recommendations}</p>
                            <p className="text-sm text-gray-600">{new Date(assessment.completed_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderGoals = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Create Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={newGoal.user_id} onChange={(e) => setNewGoal({...newGoal, user_id: e.target.value})} className="border rounded px-3 py-2">
                        <option value="">Select User</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <input type="text" value={newGoal.goal_title} onChange={(e) => setNewGoal({...newGoal, goal_title: e.target.value})} placeholder="Goal Title" className="border rounded px-3 py-2" />
                    <input type="text" value={newGoal.target_position} onChange={(e) => setNewGoal({...newGoal, target_position: e.target.value})} placeholder="Target Position" className="border rounded px-3 py-2" />
                    <input type="text" value={newGoal.target_industry} onChange={(e) => setNewGoal({...newGoal, target_industry: e.target.value})} placeholder="Target Industry" className="border rounded px-3 py-2" />
                    <input type="number" value={newGoal.timeline_months} onChange={(e) => setNewGoal({...newGoal, timeline_months: e.target.value})} placeholder="Timeline (months)" className="border rounded px-3 py-2" />
                    <select value={newGoal.priority} onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})} className="border rounded px-3 py-2">
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                    <textarea value={newGoal.goal_description} onChange={(e) => setNewGoal({...newGoal, goal_description: e.target.value})} placeholder="Goal Description" className="border rounded px-3 py-2 col-span-2" rows="3" />
                </div>
                <button onClick={createGoal} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Create Goal</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Career Goals</h3>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="border rounded px-3 py-2 mb-4">
                    <option value="">Select User to View Goals</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <div className="space-y-3">
                    {goals.map(goal => (
                        <div key={goal.id} className="border rounded p-4">
                            <h4 className="font-medium">{goal.goal_title}</h4>
                            <p className="text-sm text-gray-600">{goal.target_position} in {goal.target_industry}</p>
                            <p className="text-sm text-gray-600">Timeline: {goal.timeline_months} months</p>
                            <p className="text-sm">Priority: <span className={`font-medium ${goal.priority === 'high' ? 'text-red-600' : goal.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{goal.priority}</span></p>
                            <p className="text-sm">Progress: {goal.progress_percentage || 0}%</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderJobMatches = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Job Matching</h3>
                <div className="flex gap-4 mb-4">
                    <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="border rounded px-3 py-2">
                        <option value="">Select User</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                    <button onClick={generateJobMatches} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Generate Matches</button>
                </div>
                <div className="space-y-3">
                    {jobMatches.map(match => (
                        <div key={match.id} className="border rounded p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{match.title} at {match.company}</h4>
                                    <p className="text-sm text-gray-600">{match.location} - {match.job_type}</p>
                                    <p className="text-sm text-green-600">Match Score: {match.match_score}%</p>
                                    <p className="text-sm text-gray-600">Matching Skills: {match.matching_skills?.join(', ')}</p>
                                    <p className="text-sm text-orange-600">Skill Gaps: {match.skill_gaps?.join(', ')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-blue-600">Salary: {match.salary}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderApplications = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Job Applications</h3>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="border rounded px-3 py-2 mb-4">
                    <option value="">Select User to View Applications</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <div className="space-y-3">
                    {applications.map(app => (
                        <div key={app.id} className="border rounded p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{app.title} at {app.company}</h4>
                                    <p className="text-sm text-gray-600">{app.location} - {app.job_type}</p>
                                    <p className="text-sm text-gray-600">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                                    <p className="text-sm">Status: <span className={`font-medium ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{app.status}</span></p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => updateApplicationStatus(app.id, 'accepted')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Accept</button>
                                    <button onClick={() => updateApplicationStatus(app.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderResources = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Create Resource</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} placeholder="Resource Title" className="border rounded px-3 py-2" />
                    <select value={newResource.resource_type} onChange={(e) => setNewResource({...newResource, resource_type: e.target.value})} className="border rounded px-3 py-2">
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="course">Course</option>
                        <option value="tool">Tool</option>
                        <option value="template">Template</option>
                    </select>
                    <input type="url" value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} placeholder="Resource URL" className="border rounded px-3 py-2" />
                    <input type="text" value={newResource.category} onChange={(e) => setNewResource({...newResource, category: e.target.value})} placeholder="Category" className="border rounded px-3 py-2" />
                    <select value={newResource.target_audience} onChange={(e) => setNewResource({...newResource, target_audience: e.target.value})} className="border rounded px-3 py-2">
                        <option value="refugees">Refugees</option>
                        <option value="job_seekers">Job Seekers</option>
                        <option value="students">Students</option>
                        <option value="all">All</option>
                    </select>
                    <textarea value={newResource.description} onChange={(e) => setNewResource({...newResource, description: e.target.value})} placeholder="Description" className="border rounded px-3 py-2 col-span-2" rows="3" />
                </div>
                <button onClick={createResource} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Create Resource</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Available Resources</h3>
                <div className="space-y-3">
                    {resources.map(resource => (
                        <div key={resource.id} className="border rounded p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{resource.title}</h4>
                                    <p className="text-sm text-gray-600">{resource.resource_type} | {resource.category}</p>
                                    <p className="text-sm text-gray-600">Target: {resource.target_audience}</p>
                                    <p className="text-sm text-gray-600">{resource.description}</p>
                                </div>
                                <div className="text-right">
                                    {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View Resource</a>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCounselors = () => (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Available Counselors</h3>
            <div className="space-y-3">
                {counselors.map(counselor => (
                    <div key={counselor.id} className="border rounded p-4">
                        <h4 className="font-medium">{counselor.name}</h4>
                        <p className="text-sm text-gray-600">{counselor.email} | {counselor.phone}</p>
                        <p className="text-sm text-gray-600">Skills: {counselor.skills}</p>
                        <p className="text-sm text-gray-600">Experience: {counselor.experience}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <header className="bg-blue-600 text-white p-4 shadow">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">Career Counselor Dashboard</h1>
                </div>
            </header>
            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <div className="flex space-x-2 border-b overflow-x-auto">
                        {['sessions', 'assessments', 'goals', 'matches', 'applications', 'resources', 'counselors'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-t whitespace-nowrap ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    {activeTab === 'sessions' && renderSessions()}
                    {activeTab === 'assessments' && renderAssessments()}
                    {activeTab === 'goals' && renderGoals()}
                    {activeTab === 'matches' && renderJobMatches()}
                    {activeTab === 'applications' && renderApplications()}
                    {activeTab === 'resources' && renderResources()}
                    {activeTab === 'counselors' && renderCounselors()}
                </div>
            </div>
        </div>
    );
};

export default CounselorDashboard;