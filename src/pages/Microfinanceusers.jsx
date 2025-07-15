import React, { useState, useEffect } from 'react';
import { CreditCard, PiggyBank, BookOpen, Plus, Eye, TrendingUp, Award, DollarSign, Clock, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
    // Get user from localStorage
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch (e) {
            return {};
        }
    });
    const user_id = user?.id;
    
    const [loans, setLoans] = useState([]);
    const [savings, setSavings] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [trainingPrograms, setTrainingPrograms] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [loanForm, setLoanForm] = useState({
        amount: '',
        purpose: '',
        duration_months: '',
        income: '',
        collateral: ''
    });
    const [savingsForm, setSavingsForm] = useState({
        account_type: 'regular',
        initial_deposit: ''
    });
    const [transactionForm, setTransactionForm] = useState({
        account_id: '',
        amount: ''
    });

    const API_URL = 'http://localhost:5000/api'; // Update with your API URL

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

    // Fetch user data
    useEffect(() => {
        if (user_id) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [user_id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchLoans(),
                fetchSavings(),
                fetchTrainings(),
                fetchTrainingPrograms()
            ]);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLoans = async () => {
        try {
            const data = await makeAPICall(`${API_URL}/microfinance/loans/user/${user_id}`);
            setLoans(data);
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    const fetchSavings = async () => {
        try {
            const data = await makeAPICall(`${API_URL}/microfinance/savings/user/${user_id}`);
            setSavings(data);
        } catch (error) {
            console.error('Error fetching savings:', error);
        }
    };

    const fetchTrainings = async () => {
        try {
            const data = await makeAPICall(`${API_URL}/microfinance/training/user/${user_id}`);
            setTrainings(data);
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

    const handleLoanSubmit = async (e) => {
        e.preventDefault();
        try {
            await makeAPICall(`${API_URL}/microfinance/loans/apply`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user_id,
                    ...loanForm,
                    amount: parseInt(loanForm.amount),
                    duration_months: parseInt(loanForm.duration_months),
                    income: parseInt(loanForm.income)
                })
            });
            setShowLoanModal(false);
            setLoanForm({ amount: '', purpose: '', duration_months: '', income: '', collateral: '' });
            fetchLoans();
            alert('Loan application submitted successfully!');
        } catch (error) {
            alert('Error submitting loan application: ' + error.message);
        }
    };

    const handleSavingsSubmit = async (e) => {
        e.preventDefault();
        try {
            await makeAPICall(`${API_URL}/microfinance/savings/create`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user_id,
                    account_type: savingsForm.account_type,
                    initial_deposit: parseInt(savingsForm.initial_deposit) || 0
                })
            });
            setShowSavingsModal(false);
            setSavingsForm({ account_type: 'regular', initial_deposit: '' });
            fetchSavings();
            alert('Savings account created successfully!');
        } catch (error) {
            alert('Error creating savings account: ' + error.message);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            await makeAPICall(`${API_URL}/microfinance/savings/deposit`, {
                method: 'POST',
                body: JSON.stringify({
                    account_id: parseInt(transactionForm.account_id),
                    amount: parseInt(transactionForm.amount)
                })
            });
            setShowDepositModal(false);
            setTransactionForm({ account_id: '', amount: '' });
            fetchSavings();
            alert('Deposit successful!');
        } catch (error) {
            alert('Error processing deposit: ' + error.message);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            await makeAPICall(`${API_URL}/microfinance/savings/withdraw`, {
                method: 'POST',
                body: JSON.stringify({
                    account_id: parseInt(transactionForm.account_id),
                    amount: parseInt(transactionForm.amount)
                })
            });
            setShowWithdrawModal(false);
            setTransactionForm({ account_id: '', amount: '' });
            fetchSavings();
            alert('Withdrawal successful!');
        } catch (error) {
            alert('Error processing withdrawal: ' + error.message);
        }
    };

    const enrollInTraining = async (programId) => {
        try {
            await makeAPICall(`${API_URL}/microfinance/training/enroll`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user_id,
                    program_id: programId
                })
            });
            fetchTrainings();
            alert('Successfully enrolled in training program!');
        } catch (error) {
            alert('Error enrolling in training: ' + error.message);
        }
    };

    const completeTraining = async (programId) => {
        try {
            await makeAPICall(`${API_URL}/microfinance/training/complete`, {
                method: 'PUT',
                body: JSON.stringify({
                    user_id: user_id,
                    program_id: programId
                })
            });
            fetchTrainings();
            alert('Training completed successfully!');
        } catch (error) {
            alert('Error completing training: ' + error.message);
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

    const totalSavings = savings.reduce((sum, account) => sum + account.balance, 0);
    const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const completedTrainings = trainings.filter(t => t.status === 'completed').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user_id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
                    <p className="text-gray-600">You need to be logged in to access your dashboard.</p>
                    <button 
                        onClick={() => {
                            // Mock login for testing
                            const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
                            localStorage.setItem('user', JSON.stringify(mockUser));
                            setUser(mockUser);
                        }}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                    >
                        Mock Login (for testing)
                    </button>
                </div>
            </div>
        );
    }

    return (
       <div className="min-h-screen bg-gray-50 mt-16">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user.name || 'User'}! Here's your financial overview.</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex space-x-8 border-b">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'loans', label: 'Loans', icon: CreditCard },
                        { id: 'savings', label: 'Savings', icon: PiggyBank },
                        { id: 'training', label: 'Training', icon: BookOpen }
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
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Savings</p>
                                        <p className="text-2xl font-bold text-gray-900">RWF {totalSavings.toLocaleString()}</p>
                                    </div>
                                    <PiggyBank className="w-8 h-8 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Loans</p>
                                        <p className="text-2xl font-bold text-gray-900">RWF {totalLoans.toLocaleString()}</p>
                                    </div>
                                    <CreditCard className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed Training</p>
                                        <p className="text-2xl font-bold text-gray-900">{completedTrainings}</p>
                                    </div>
                                    <Award className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                {loans.length === 0 && savings.length === 0 && trainings.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No recent activity. Start by applying for a loan or opening a savings account!</p>
                                ) : (
                                    <div className="space-y-4">
                                        {loans.slice(0, 3).map(loan => (
                                            <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                                                <div className="flex items-center space-x-3">
                                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="font-medium">Loan Application</p>
                                                        <p className="text-sm text-gray-600">RWF {loan.amount.toLocaleString()} - {loan.purpose}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                        ))}
                                        {trainings.slice(0, 2).map(training => (
                                            <div key={training.id} className="flex items-center justify-between border-b pb-2">
                                                <div className="flex items-center space-x-3">
                                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                                    <div>
                                                        <p className="font-medium">Training Program</p>
                                                        <p className="text-sm text-gray-600">{training.title}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                                                    {training.status}
                                                </span>
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
                            <h2 className="text-xl font-bold text-gray-900">My Loans</h2>
                            <button
                                onClick={() => setShowLoanModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Apply for Loan</span>
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {loans.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">You haven't applied for any loans yet.</p>
                                    <button
                                        onClick={() => setShowLoanModal(true)}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                                    >
                                        Apply for Your First Loan
                                    </button>
                                </div>
                            ) : (
                                loans.map(loan => (
                                    <div key={loan.id} className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">RWF {loan.amount.toLocaleString()}</h3>
                                                <p className="text-gray-600">{loan.purpose}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Duration: {loan.duration_months} months | Credit Score: {loan.credit_score}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'savings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">My Savings</h2>
                            <button
                                onClick={() => setShowSavingsModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Account</span>
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {savings.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">You don't have any savings accounts yet.</p>
                                    <button
                                        onClick={() => setShowSavingsModal(true)}
                                        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
                                    >
                                        Open Your First Account
                                    </button>
                                </div>
                            ) : (
                                savings.map(account => (
                                    <div key={account.id} className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 capitalize">{account.account_type} Account</h3>
                                                <p className="text-2xl font-bold text-green-600 mt-1">RWF {account.balance.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => {
                                                    setTransactionForm({ ...transactionForm, account_id: account.id });
                                                    setShowDepositModal(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                                            >
                                                Deposit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setTransactionForm({ ...transactionForm, account_id: account.id });
                                                    setShowWithdrawModal(true);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                                            >
                                                Withdraw
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Training Programs</h2>
                        
                        {/* My Enrollments */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">My Enrollments</h3>
                            </div>
                            <div className="p-6">
                                {trainings.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">You haven't enrolled in any training programs yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {trainings.map(training => (
                                            <div key={training.id} className="flex items-center justify-between border-b pb-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{training.title}</h4>
                                                    <p className="text-sm text-gray-600">{training.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(training.status)}`}>
                                                        {training.status}
                                                    </span>
                                                    {training.status === 'enrolled' && (
                                                        <button
                                                            onClick={() => completeTraining(training.id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Available Programs */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">Available Programs</h3>
                            </div>
                            <div className="p-6">
                                {trainingPrograms.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No training programs available at the moment.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {trainingPrograms.map(program => {
                                            const isEnrolled = trainings.some(t => t.id === program.id);
                                            return (
                                                <div key={program.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{program.title}</h4>
                                                            <p className="text-gray-600 mt-1">{program.description}</p>
                                                            <p className="text-sm text-gray-500 mt-2">
                                                                Duration: {program.duration} | Level: {program.level}
                                                            </p>
                                                        </div>
                                                        <div className="ml-4">
                                                            {isEnrolled ? (
                                                                <span className="text-green-600 font-medium">Enrolled</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => enrollInTraining(program.id)}
                                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
                                                                >
                                                                    Enroll
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loan Application Modal */}
            {showLoanModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium mb-4">Apply for Loan</h3>
                        <form onSubmit={handleLoanSubmit} className="space-y-4">
                            <input
                                type="number"
                                placeholder="Amount (RWF)"
                                value={loanForm.amount}
                                onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Purpose"
                                value={loanForm.purpose}
                                onChange={e => setLoanForm({ ...loanForm, purpose: e.target.value })}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Duration (months)"
                                value={loanForm.duration_months}
                                onChange={e => setLoanForm({ ...loanForm, duration_months: e.target.value })}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Monthly Income (RWF)"
                                value={loanForm.income}
                                onChange={e => setLoanForm({ ...loanForm, income: e.target.value })}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Collateral (optional)"
                                value={loanForm.collateral}
                                onChange={e => setLoanForm({ ...loanForm, collateral: e.target.value })}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                                >
                                    Submit Application
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLoanModal(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Savings Account Modal */}
            {showSavingsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium mb-4">Create Savings Account</h3>
                        <form onSubmit={handleSavingsSubmit} className="space-y-4">
                            <select
                                value={savingsForm.account_type}
                                onChange={e => setSavingsForm({ ...savingsForm, account_type: e.target.value })}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="regular">Regular Savings</option>
                                <option value="emergency">Emergency Fund</option>
          <option value="business">Business Savings</option>
        </select>
        <input
          type="number"
          placeholder="Initial Deposit (RWF)"
          value={savingsForm.initial_deposit}
          onChange={e => setSavingsForm({ ...savingsForm, initial_deposit: e.target.value })}
          className="w-full p-3 border rounded-md"
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setShowSavingsModal(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showDepositModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h3 className="text-lg font-medium mb-4">Make Deposit</h3>
      <form onSubmit={handleDeposit} className="space-y-4">
        <input
          type="number"
          placeholder="Amount (RWF)"
          value={transactionForm.amount}
          onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })}
          className="w-full p-3 border rounded-md"
          required
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setShowDepositModal(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showWithdrawModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h3 className="text-lg font-medium mb-4">Make Withdrawal</h3>
      <form onSubmit={handleWithdraw} className="space-y-4">
        <input
          type="number"
          placeholder="Amount (RWF)"
          value={transactionForm.amount}
          onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })}
          className="w-full p-3 border rounded-md"
          required
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md"
          >
            Withdraw
          </button>
          <button
            type="button"
            onClick={() => setShowWithdrawModal(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
    )}
        </div>
    );
};

        

  export default UserDashboard;