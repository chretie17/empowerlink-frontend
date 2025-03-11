import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import API_URL from '../api';

const Reports = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('user-overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref for PDF printing
  const reportRef = React.useRef();
  
  // Load data on tab change or filter apply
  useEffect(() => {
    fetchReportData();
  }, [activeTab]);
  
  // Handle printing to PDF
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `EmpowerLink_${activeTab}_Report`,
  });
  
  // Fetch report data with optional filters
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchTerm) params.append('search', searchTerm);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`${API_URL}/reports/${activeTab}${queryString}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply search and date filters
  const handleApplyFilters = () => {
    fetchReportData();
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setTimeout(fetchReportData, 10);
  };
  
  // Render different report tabs
  const renderReport = () => {
    switch (activeTab) {
      case 'user-overview':
        return renderUserOverview();
      case 'job-market':
        return renderJobMarket();
      case 'skills-assessment':
        return renderSkillsAssessment();
      case 'community-engagement':
        return renderCommunityEngagement();
      default:
        return <div>Select a report type</div>;
    }
  };
  
  // Render user overview report
  const renderUserOverview = () => {
    const { usersByRole, recentUsers, completeProfiles, usersBySkillCategory } = reportData;
    
    if (!usersByRole) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Role</h3>
          <div className="grid grid-cols-3 gap-4">
            {usersByRole.map(role => (
              <div key={role.role} className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{role.count}</div>
                <div className="text-gray-600 capitalize">{role.role}s</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Registrations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.slice(0, 5).map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Skills Categories */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {usersBySkillCategory && usersBySkillCategory.map(category => (
              <div key={category.category_name} className="flex justify-between items-center p-3 border rounded-lg">
                <span>{category.category_name}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{category.user_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render job market report
  const renderJobMarket = () => {
    const { totalJobs, jobsByLocation, applicationStats } = reportData;
    
    if (!totalJobs) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Job Overview */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Market Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalJobs.total_jobs}</div>
              <div className="text-gray-600">Total Jobs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{totalJobs.active_jobs}</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
          </div>
        </div>
        
        {/* Locations */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Locations</h3>
          <div className="space-y-3">
            {jobsByLocation && jobsByLocation.map(location => (
              <div key={location.location} className="flex items-center">
                <div className="w-32">{location.location}</div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(location.job_count / jobsByLocation[0].job_count) * 100}%` }}>
                    </div>
                  </div>
                </div>
                <div className="w-10 text-right">{location.job_count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Application Stats */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Statistics</h3>
          {applicationStats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg text-center bg-gray-50">
                <div className="text-2xl font-bold text-gray-700">{applicationStats.total_applications}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-green-50">
                <div className="text-2xl font-bold text-green-600">{applicationStats.accepted_applications}</div>
                <div className="text-gray-600">Accepted</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{applicationStats.pending_applications}</div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render skills assessment report
  const renderSkillsAssessment = () => {
    const { commonSkills, skillGap, topSkilledUsers } = reportData;
    
    if (!commonSkills) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Common Skills */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Common Skills</h3>
          <div className="space-y-3">
            {commonSkills.slice(0, 5).map(skill => (
              <div key={skill.skill_name} className="flex items-center">
                <div className="w-32">{skill.skill_name}</div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-cyan-600 h-2.5 rounded-full" 
                          style={{ width: `${(skill.user_count / commonSkills[0].user_count) * 100}%` }}>
                    </div>
                  </div>
                </div>
                <div className="w-10 text-right">{skill.user_count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skill Gap */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Demand-Supply Gap</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supply</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gap</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skillGap && skillGap.slice(0, 5).map(skill => (
                  <tr key={skill.skill_name}>
                    <td className="px-6 py-4 whitespace-nowrap">{skill.skill_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{skill.demand_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{skill.supply_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${skill.gap > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {skill.gap > 0 ? `${skill.gap} shortage` : `${Math.abs(skill.gap)} surplus`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Users */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Skilled Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSkilledUsers && topSkilledUsers.slice(0, 5).map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.avg_proficiency}/5</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.skills_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // Render community engagement report
  const renderCommunityEngagement = () => {
    const { forumActivity, successStories, popularTopics } = reportData;
    
    if (!forumActivity) return <div className="text-center">No data available</div>;
    
    return (
      <div className="space-y-6">
        {/* Forum Activity */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Activity</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg text-center bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">{forumActivity.total_topics}</div>
              <div className="text-gray-600">Topics</div>
            </div>
            <div className="p-4 rounded-lg text-center bg-indigo-50">
              <div className="text-2xl font-bold text-indigo-600">{forumActivity.total_posts}</div>
              <div className="text-gray-600">Posts</div>
            </div>
            <div className="p-4 rounded-lg text-center bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{forumActivity.active_users}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
        
        {/* Success Stories */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Success Stories</h3>
          {successStories && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg text-center bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{successStories.total_stories}</div>
                <div className="text-gray-600">Total Stories</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-green-50">
                <div className="text-2xl font-bold text-green-600">{successStories.approved_stories}</div>
                <div className="text-gray-600">Approved</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Popular Topics */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Discussion Topics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularTopics && popularTopics.slice(0, 5).map(topic => (
                  <tr key={topic.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{topic.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{topic.post_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(topic.last_activity).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">EmpowerLink Reports</h1>
            <p className="text-blue-100">System analytics and performance metrics</p>
          </div>
          
          {/* Filters */}
          <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md shadow-sm p-2 w-full"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleApplyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
                
                <button 
                  onClick={handleClearFilters}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
                
                <button 
                  onClick={handlePrint}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
          
          {/* Report Tabs */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('user-overview')}
                className={`px-4 py-2 rounded-md ${activeTab === 'user-overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                User Overview
              </button>
              
              <button
                onClick={() => setActiveTab('job-market')}
                className={`px-4 py-2 rounded-md ${activeTab === 'job-market' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Job Market
              </button>
              
              <button
                onClick={() => setActiveTab('skills-assessment')}
                className={`px-4 py-2 rounded-md ${activeTab === 'skills-assessment' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Skills Assessment
              </button>
              
              <button
                onClick={() => setActiveTab('community-engagement')}
                className={`px-4 py-2 rounded-md ${activeTab === 'community-engagement' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Community Engagement
              </button>
            </div>
          </div>
          
          {/* Report Content */}
          <div className="p-6" ref={reportRef}>
            {/* Report Title for PDF */}
            <div className="mb-6 print-only">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'user-overview' && 'User Overview Report'}
                {activeTab === 'job-market' && 'Job Market Report'}
                {activeTab === 'skills-assessment' && 'Skills Assessment Report'}
                {activeTab === 'community-engagement' && 'Community Engagement Report'}
              </h2>
              <p className="text-sm text-gray-500">
                {startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : 
                 startDate ? `From ${startDate}` : 
                 endDate ? `Until ${endDate}` : 
                 'All Time Data'}
              </p>
              {searchTerm && <p className="text-sm text-gray-500">Search: "{searchTerm}"</p>}
              <hr className="my-4" />
            </div>
            
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              renderReport()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;expo