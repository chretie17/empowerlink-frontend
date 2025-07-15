import React, { useState, useEffect } from 'react';
import { Users, CreditCard, PiggyBank, BookOpen, CheckCircle, XCircle, Eye, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loans, setLoans] = useState([]);
    const [savings, setSavings] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [trainingPrograms, setTrainingPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLoans: 0,
        pendingLoans: 0,
        approvedLoans: 0,
        totalSavings: 0,
        totalUsers: 0,
        completedTrainings: 0
    });

    const API_URL = 'http://localhost:5000/api';

    // API call function
    const makeAPICall = async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchLoans(),
                fetchSavings(),
                fetchTrainings(),
                fetchTrainingPrograms()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoans = async () => {
        try {
            const data = await makeAPICall(`${API_URL}/microfinance/loans`);
            setLoans(data);
            updateStats(data, 'loans');
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    const fetchSavings = async () => {
        try {
            const data = await makeAPICall(`${API_URL}/microfinance/savings`);
            setSavings(data);
            updateStats(data, 'savings');
        } catch (error) {
            console.error('Error fetching savings:', error);
        }
    };

    const fetchTrainings = async () => {
        try {
           const data = await makeAPICall(`${API_URL}/microfinance/trainings/enrollments`);
            setTrainings(data);
            updateStats(data, 'trainings');
        } catch (error) {
            console.error('Error fetching trainings:', error);
        }
    };

    const fetchTrainingPrograms = async () => {
        try {
            const data = await makeAPICall(`${API_URL}/microfinance/training/programs`);
            setTrainingPrograms(data);
        } catch (error) {
            console.error('Error fetching training programs:', error);
        }
    };

    const updateStats = (data, type) => {
        setStats(prev => {
            const newStats = { ...prev };
            
            if (type === 'loans') {
                newStats.totalLoans = data.length;
                newStats.pendingLoans = data.filter(l => l.status === 'pending').length;
                newStats.approvedLoans = data.filter(l => l.status === 'approved').length;
            } else if (type === 'savings') {
                newStats.totalSavings = data.reduce((sum, account) => sum + account.balance, 0);
            } else if (type === 'trainings') {
                newStats.completedTrainings = data.filter(t => t.status === 'completed').length;
            }
            
            return newStats;
        });
    };

    const updateLoanStatus = async (loanId, newStatus) => {
        try {
            await makeAPICall(`${API_URL}/microfinance/loans/${loanId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            fetchLoans();
            alert(`Loan ${newStatus} successfully!`);
        } catch (error) {
            alert('Error updating loan status: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'completed': return 'text-blue-600 bg-blue-100';
            case 'enrolled': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatCurrency = (amount) => {
        return `RWF ${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
         <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Microfinance Admin Dashboard</h1>
                    <p className="text-gray-600">Manage loans, savings, and training programs</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex space-x-8 border-b">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'loans', label: 'Loans Management', icon: CreditCard },
                        { id: 'savings', label: 'Savings Accounts', icon: PiggyBank },
                        { id: 'training', label: 'Training Programs', icon: BookOpen },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Loans</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
                                    </div>
                                    <CreditCard className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingLoans}</p>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Approved Loans</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.approvedLoans}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Savings</p>
                                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalSavings)}</p>
                                    </div>
                                    <PiggyBank className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">Recent Loan Applications</h3>
                            </div>
                            <div className="p-6">
                                {loans.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No loan applications yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {loans.slice(0, 5).map(loan => (
                                            <div key={loan.id} className="flex items-center justify-between border-b pb-4">
                                                <div className="flex items-center space-x-4">
                                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="font-medium">User ID: {loan.user_id}</p>
                                                        <p className="text-sm text-gray-600">{formatCurrency(loan.amount)} - {loan.purpose}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {loan.duration_months} months | Credit Score: {loan.credit_score}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                        {loan.status}
                                                    </span>
                                                    {loan.status === 'pending' && (
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => updateLoanStatus(loan.id, 'approved')}
                                                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => updateLoanStatus(loan.id, 'rejected')}
                                                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'loans' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Loans Management</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={fetchLoans}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Credit Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loans.map(loan => (
                                        <tr key={loan.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">User ID: {loan.user_id}</p>
                                                    <p className="text-sm text-gray-500">{loan.purpose}</p>
                                                    <p className="text-xs text-gray-400">{loan.duration_months} months</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatCurrency(loan.amount)}</div>
                                                <div className="text-sm text-gray-500">Income: {formatCurrency(loan.income)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{loan.credit_score}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {loan.status === 'pending' ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => updateLoanStatus(loan.id, 'approved')}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateLoanStatus(loan.id, 'rejected')}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">No actions available</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
{activeTab === 'savings' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-gray-900">Savings Accounts</h2>
      <button
        onClick={fetchSavings}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Refresh
      </button>
    </div>

    {savings.length === 0 ? (
      <p className="text-gray-500 text-center py-8">
        No savings accounts found.
      </p>
    ) : (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {savings.map(account => (
              <tr key={account.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.user_name || account.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{account.account_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">RWF {account.balance.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(account.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


                {activeTab === 'training' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Training Programs</h2>
                            <button
                                onClick={fetchTrainingPrograms}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">Available Programs</h3>
                            </div>
                            <div className="p-6">
                                {trainingPrograms.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No training programs available.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {trainingPrograms.map(program => (
                                            <div key={program.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{program.title}</h4>
                                                        <p className="text-gray-600 mt-1">{program.description}</p>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Duration: {program.duration} | Level: {program.level}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">
                                                            Created: {new Date(program.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                    
            </div>
        </div>
    );
};

export default AdminDashboard;