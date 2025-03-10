import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Snackbar, Alert } from '@mui/material';

const SkillsAssessment = () => {
    const [loading, setLoading] = useState(true);
    const [skillCategories, setSkillCategories] = useState([]);
    const [userSkills, setUserSkills] = useState({});
    const [trainingResources, setTrainingResources] = useState([]);
    const [recommendedTraining, setRecommendedTraining] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [activeTab, setActiveTab] = useState('assessment');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;

    useEffect(() => {
        const fetchData = async () => {
            if (!user_id) {
                setLoading(false);
                setSnackbarMessage('You must be logged in to access this feature');
                setSnackbarSeverity('warning');
                setOpenSnackbar(true);
                return;
            }
            
            setLoading(true);
            try {
                // Fetch skill categories
                const categoriesResponse = await axios.get(`${API_URL}/skills/categories`);
                setSkillCategories(categoriesResponse.data);
                
                // Fetch user's existing skill assessments
                const userSkillsResponse = await axios.get(`${API_URL}/skills/user/${user_id}`);
                
                // Convert array of user skills to an object mapping skill_id to proficiency_level
                const userSkillsMap = {};
                userSkillsResponse.data.forEach(skill => {
                    userSkillsMap[skill.skill_id] = skill.proficiency_level;
                });
                setUserSkills(userSkillsMap);
                
                // Fetch training resources
                const trainingResponse = await axios.get(`${API_URL}/training`);
                setTrainingResources(trainingResponse.data);
                
                // Fetch recommended training
                const recommendedResponse = await axios.get(`${API_URL}/training/recommended/${user_id}`);
                setRecommendedTraining(recommendedResponse.data);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setSnackbarMessage('Failed to load data. Please try again later.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user_id]);

    // Handle skill rating change
    const handleSkillRatingChange = async (skillId, rating) => {
        try {
            // Update local state immediately for responsive UI
            setUserSkills(prev => ({
                ...prev,
                [skillId]: rating
            }));
            
            // Send the update to the server
            await axios.post(`${API_URL}/skills/user`, {
                user_id: user_id,
                skill_id: skillId,
                proficiency_level: rating
            });
            
            // Refresh recommended training
            const recommendedResponse = await axios.get(`${API_URL}/training/recommended/${user_id}`);
            setRecommendedTraining(recommendedResponse.data);
            
        } catch (error) {
            console.error('Error updating skill:', error);
            setSnackbarMessage('Failed to update skill. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // Filter training resources based on search term
    const filteredTraining = searchTerm
        ? trainingResources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.language?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : activeTab === 'recommended' ? recommendedTraining : trainingResources;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-800">
                            <span className="border-b-4 border-blue-500 pb-1">Skills & Training</span>
                        </h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('assessment')}
                            className={`py-2 px-4 font-medium text-sm mr-4 ${activeTab === 'assessment' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Skills Assessment
                        </button>
                        <button
                            onClick={() => setActiveTab('recommended')}
                            className={`py-2 px-4 font-medium text-sm mr-4 ${activeTab === 'recommended' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Recommended Training
                        </button>
                        <button
                            onClick={() => setActiveTab('all-training')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'all-training' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All Training Resources
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Skills Assessment Tab */}
                            {activeTab === 'assessment' && (
                                <div>
                                    <div className="mb-6">
                                        <p className="text-gray-700 mb-4">
                                            Rate your proficiency in each skill from 1 (Beginner) to 5 (Expert). This will help us recommend relevant training resources and match you with suitable job opportunities.
                                        </p>
                                        
                                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center text-blue-800 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">Why this matters</span>
                                            </div>
                                            <p className="text-sm text-blue-800 ml-7">
                                                Being honest about your skills helps us find the right opportunities for you. Even skills rated low can be valuable in certain roles, and we can suggest training to help you improve.
                                            </p>
                                        </div>
                                    </div>

                                    {skillCategories.map(category => (
                                        <div key={category.id} className="mb-8">
                                            <h3 className="text-xl font-semibold text-blue-700 mb-4">{category.name}</h3>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-1 gap-4">
                                                    {category.skills.map(skill => (
                                                        <div key={skill.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                                <div className="mb-3 md:mb-0">
                                                                    <h4 className="font-medium text-gray-800">{skill.name}</h4>
                                                                    <p className="text-gray-600 text-sm">{skill.description}</p>
                                                                </div>
                                                                <div className="flex">
                                                                    {[1, 2, 3, 4, 5].map(rating => (
                                                                        <button
                                                                            key={rating}
                                                                            onClick={() => handleSkillRatingChange(skill.id, rating)}
                                                                            className={`w-10 h-10 mx-1 rounded-full flex items-center justify-center ${
                                                                                userSkills[skill.id] === rating
                                                                                    ? 'bg-blue-600 text-white'
                                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                            }`}
                                                                        >
                                                                            {rating}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Training Resources Tab (either recommended or all) */}
                            {(activeTab === 'recommended' || activeTab === 'all-training') && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-blue-700">
                                            {activeTab === 'recommended' ? 'Recommended Training' : 'All Training Resources'}
                                        </h2>
                                        <div className="relative w-64">
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    {filteredTraining.length === 0 ? (
                                        <div className="bg-blue-50 text-blue-700 p-6 rounded-lg text-center">
                                            {activeTab === 'recommended' ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <h3 className="text-xl font-bold mb-2">No recommended training</h3>
                                                    <p className="text-blue-600">
                                                        Great job! Based on your skill assessment, you don't need any specific training right now.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <h3 className="text-xl font-bold mb-2">No training resources found</h3>
                                                    <p className="text-blue-600">
                                                        No training resources match your search. Try a different search term.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {filteredTraining.map(resource => (
                                                <div key={resource.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                    <div className="p-6">
                                                        <h3 className="text-lg font-semibold text-blue-800 mb-2">{resource.title}</h3>
                                                        <p className="text-gray-600 mb-4">
                                                            <span className="font-medium">Provider:</span> {resource.provider}
                                                        </p>
                                                        <p className="text-gray-700 mb-4">{resource.description}</p>
                                                        
                                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                                            <div>
                                                                <span className="text-gray-500 text-sm">Type:</span>
                                                                <p className="font-medium">{resource.type}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 text-sm">Duration:</span>
                                                                <p className="font-medium">{resource.duration}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 text-sm">Cost:</span>
                                                                <p className="font-medium">{resource.cost}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 text-sm">Language:</span>
                                                                <p className="font-medium">{resource.language}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {resource.skills && resource.skills.length > 0 && (
                                                            <div className="mb-4">
                                                                <span className="text-gray-500 text-sm">Skills covered:</span>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {resource.skills.map(skill => (
                                                                        <span key={skill.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                                            {skill.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <a 
                                                            href={resource.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                                                        >
                                                            View Resource
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
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

export default SkillsAssessment;