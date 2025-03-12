import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import API_URL from '../api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [skillsDistribution, setSkillsDistribution] = useState([]);
  const [jobMarketTrends, setJobMarketTrends] = useState({ categories: [], data: [] });
  const [applicationFunnel, setApplicationFunnel] = useState([]);
  
  useEffect(() => {
    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [statsRes, skillsRes, jobTrendsRes, funnelRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/stats`),
          axios.get(`${API_URL}/dashboard/skills-distribution`),
          axios.get(`${API_URL}/dashboard/job-market-trends`),
          axios.get(`${API_URL}/dashboard/application-funnel`)
        ]);
        
        // Set all data to state
        setDashboardStats(statsRes.data);
        setSkillsDistribution(skillsRes.data);
        setJobMarketTrends(jobTrendsRes.data);
        setApplicationFunnel(funnelRes.data);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format numbers with commas for readability
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
  };
  
  // Calculate colors for funnel chart
  const getFunnelColor = (index, length) => {
    const opacity = 0.5 + (0.5 * (index / (length - 1)));
    return `rgba(23, 93, 220, ${opacity})`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Users Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(dashboardStats?.userStats?.totalUsers)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {formatNumber(dashboardStats?.userStats?.newUsersLast30Days)} new in last 30 days
            </p>
          </div>
          
          {/* Active Jobs Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(dashboardStats?.jobStats?.activeJobs)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Out of {formatNumber(dashboardStats?.jobStats?.totalJobs)} total jobs
            </p>
          </div>
          
          {/* Success Rate Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-teal-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats?.applicationStats?.successRate || 0}%
                </p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {formatNumber(dashboardStats?.applicationStats?.acceptedApplications)} accepted applications
            </p>
          </div>
          
          {/* Community Engagement Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Community Activity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(
                    (dashboardStats?.communityStats?.newTopicsLast30Days || 0) + 
                    (dashboardStats?.communityStats?.newPostsLast30Days || 0)
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              New posts & topics in last 30 days
            </p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Skills Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Common Skills</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillsDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="skillName" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="userCount" name="Users with skill" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Job Market Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Posting Trends</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={jobMarketTrends.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {jobMarketTrends.categories.map((category, index) => {
                    // Generate different colors for each category
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                    return (
                      <Line 
                        key={category}
                        type="monotone" 
                        dataKey={category} 
                        name={category}
                        stroke={colors[index % colors.length]} 
                        activeDot={{ r: 8 }} 
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Application Funnel Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={applicationFunnel}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Applications" 
                  stroke="#1751d8" 
                  fill="#1751d8" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {applicationFunnel.map((stage, index) => (
              <div 
                key={stage.stage} 
                className="text-center p-2 rounded"
                style={{ backgroundColor: `rgba(23, 93, 220, ${0.2 + (0.2 * index)})` }}
              >
                <p className="font-medium text-gray-900">{stage.stage}</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(stage.count)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;