import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Chip, Typography, Box, Snackbar, Alert, 
  CircularProgress, FormControl, InputLabel, Select, MenuItem, OutlinedInput,
  Checkbox, ListItemText, Card, CardContent, Divider, Avatar, Rating,
  Grid, Tooltip, Tabs, Tab
} from '@mui/material';
import { 
  Search, Refresh, Person, School, Email, Phone, 
  LocationOn, Psychology, Badge, Stars, StarBorder,
  Visibility, ArrowForward, FilterList, Close, Work,
  Book, Assignment, CheckCircle
} from '@mui/icons-material';
import moment from 'moment';

// Custom tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`talent-tabpanel-${index}`}
      aria-labelledby={`talent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EmployerTalentSearch = () => {
  // State for search options
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minProficiency, setMinProficiency] = useState(1);
  const [sortBy, setSortBy] = useState('skills_count');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Get the employer ID from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const employer_id = user?.id;
  
  useEffect(() => {
    // Fetch skills for filtering
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${API_URL}/skills/categories`);
        setCategories(response.data);
        
        // Extract all skills from categories
        const allSkills = [];
        response.data.forEach(category => {
          category.skills.forEach(skill => {
            allSkills.push({
              ...skill,
              category_name: category.name
            });
          });
        });
        
        setSkills(allSkills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setSnackbarMessage('Failed to load skills data.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    
    fetchSkills();
    
    // Also load all users with skill stats initially
    handleFetchAllUsers();
  }, []);
  
  // Effect to filter users based on search term
  useEffect(() => {
    if (users.length > 0) {
      if (searchTerm.trim() === '') {
        setFilteredUsers(users);
      } else {
        const filtered = users.filter(user => 
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.skills_text && user.skills_text.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredUsers(filtered);
      }
    }
  }, [searchTerm, users]);

  // Handle tabChange
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
    
    if (newValue === 0) {
      handleFetchAllUsers();
    }
  };
  
  // Handle search by a single skill
  const handleSingleSkillSearch = async () => {
    if (!selectedSkill) {
      setSnackbarMessage('Please select a skill to search.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/employer/users-by-skill`, {
        params: {
          skill_id: selectedSkill,
          min_proficiency: minProficiency
        }
      });
      
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
      
      if (response.data.length === 0) {
        setSnackbarMessage('No talent found with the selected skill at the specified proficiency level.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error searching users by skill:', error);
      setSnackbarMessage('Failed to search talents.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };
  
  // Handle search by multiple skills
  const handleMultiSkillSearch = async () => {
    if (!selectedSkills.length) {
      setSnackbarMessage('Please select at least one skill to search.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/employer/users-by-multiple-skills`, {
        skill_ids: selectedSkills,
        min_proficiency: minProficiency
      });
      
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
      
      if (response.data.length === 0) {
        setSnackbarMessage('No Talents found with all the selected skills at the specified proficiency level.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error searching users by multiple skills:', error);
      setSnackbarMessage('Failed to search Talents.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };
  
  // Handle fetching all users
  const handleFetchAllUsers = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/employer/users`);
      
      // Apply default sorting
      const sortedUsers = sortUsers(response.data, sortBy);
      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setSnackbarMessage('Failed to load talent data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };
  
  // Handle viewing user details
  const handleViewUserProfile = async (userId) => {
    setUserDetailsLoading(true);
    setUserDetailsOpen(true);
    
    try {
      const response = await axios.get(`${API_URL}/employer/user-profile/${userId}`);
      setSelectedUser(response.data);
      setUserDetailsLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSnackbarMessage('Failed to load talent profile.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUserDetailsLoading(false);
      setUserDetailsOpen(false);
    }
  };
  
  // Helper to get skill name by ID
  const getSkillName = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Unknown Skill';
  };
  
  // Helper to get category name for a skill
  const getSkillCategoryName = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.category_name : '';
  };
  
  // Sort users based on criteria
  const sortUsers = (usersToSort, criterion) => {
    const sorted = [...usersToSort];
    switch (criterion) {
      case 'skills_count':
        return sorted.sort((a, b) => ((b.skills_count || 0) - (a.skills_count || 0)));
      case 'avg_proficiency':
        return sorted.sort((a, b) => ((b.avg_proficiency || 0) - (a.avg_proficiency || 0)));
      case 'expert_skills':
        return sorted.sort((a, b) => ((b.expert_skills_count || 0) - (a.expert_skills_count || 0)));
      case 'name':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:
        return sorted;
    }
  };
  
  // Handle sort change
  const handleSortChange = (criterion) => {
    setSortBy(criterion);
    const sorted = sortUsers(filteredUsers, criterion);
    setFilteredUsers(sorted);
  };
  
  // Render proficiency level as stars
  const renderProficiencyStars = (level) => {
    return (
      <Rating 
        value={level || 0} 
        readOnly 
        max={5}
        size="small"
        emptyIcon={<StarBorder fontSize="inherit" />}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                <span className="border-b-4 border-blue-500 pb-1">Talent Search</span>
              </h1>
              <p className="text-gray-600 mt-2">Find and connect with qualified talents for your business needs</p>
            </div>
          </div>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="talent search tabs"
              centered
            >
              <Tab 
                label={
                  <div className="flex items-center py-2">
                    <Person className="mr-2" />
                    <span>All Talents</span>
                  </div>
                } 
              />
              <Tab 
                label={
                  <div className="flex items-center py-2">
                    <Psychology className="mr-2" />
                    <span>Search by Skills</span>
                  </div>
                } 
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {/* General search with filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
              <div className="relative w-full md:w-96">
                <TextField
                  placeholder="Search by name, email, skills..."
                  variant="outlined"
                  fullWidth
                  size="medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: searchTerm && (
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Close fontSize="small" />
                      </IconButton>
                    ),
                    style: { borderRadius: '0.5rem' }
                  }}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
                >
                  Sort & Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('skills_count');
                    handleFetchAllUsers();
                  }}
                  sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
                >
                  Refresh
                </Button>
              </div>
            </div>
            
            {filtersOpen && (
              <Paper elevation={0} className="p-4 mb-6 border border-gray-200 rounded-xl">
                <Typography variant="subtitle2" className="text-gray-700 mb-3">
                  Sort Talents By:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  <Chip 
                    label="Most Skills" 
                    clickable
                    onClick={() => handleSortChange('skills_count')}
                    color={sortBy === 'skills_count' ? 'primary' : 'default'}
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label="Highest Proficiency" 
                    clickable
                    onClick={() => handleSortChange('avg_proficiency')}
                    color={sortBy === 'avg_proficiency' ? 'primary' : 'default'}
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label="Expert Skills" 
                    clickable
                    onClick={() => handleSortChange('expert_skills')}
                    color={sortBy === 'expert_skills' ? 'primary' : 'default'}
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label="Name (A-Z)" 
                    clickable
                    onClick={() => handleSortChange('name')}
                    color={sortBy === 'name' ? 'primary' : 'default'}
                    sx={{ fontWeight: 500 }}
                  />
                </div>
              </Paper>
            )}
            
            <div className="mb-4">
              <Typography variant="subtitle1" className="text-gray-700">
                {loading ? 'Searching...' : `${filteredUsers.length} ${filteredUsers.length === 1 ? 'Talents' : 'Talents'} Found`}
              </Typography>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <CircularProgress />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Person className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No Talents found
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mb-4 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'There are no Talents in the system yet'}
                </Typography>
                {searchTerm && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearchTerm('')}
                    style={{ borderRadius: '0.5rem', textTransform: 'none' }}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <Grid container spacing={3}>
                {filteredUsers.map((user) => (
                  <Grid item xs={12} md={6} key={user.id}>
                    <Card className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-0">
                        <div className="p-4 flex items-center space-x-4">
                          <Avatar 
                            alt={user.name || 'User'}
                            sx={{ width: 64, height: 64, bgcolor: '#3b82f6' }}
                          >
                            {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <Typography variant="h6" className="font-semibold text-gray-800 truncate">
                              {user.name || user.username || 'Unnamed User'}
                            </Typography>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {user.email && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Email fontSize="small" className="mr-1 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Phone fontSize="small" className="mr-1 flex-shrink-0" />
                                  <span className="truncate">{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Divider />
                        
                        <div className="p-4 bg-gray-50">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <Typography variant="caption" className="text-gray-500 block">Skills</Typography>
                              <div className="flex items-center">
                                <Badge className="mr-1.5 text-blue-600" />
                                <Typography variant="body2" className="font-medium">
                                  {user.skills_count || 0}
                                </Typography>
                              </div>
                            </div>
                            <div>
                              <Typography variant="caption" className="text-gray-500 block">Expert In</Typography>
                              <div className="flex items-center">
                                <Stars className="mr-1.5 text-amber-500" />
                                <Typography variant="body2" className="font-medium">
                                  {user.expert_skills_count || 0}
                                </Typography>
                              </div>
                            </div>
                            <div>
                              <Typography variant="caption" className="text-gray-500 block">Avg. Level</Typography>
                              <div className="flex items-center">
                                <Typography variant="body2" className="font-medium">
                                  {user.avg_proficiency 
                                    ? Math.round(user.avg_proficiency * 10) / 10 
                                    : 'N/A'}
                                </Typography>
                                <span className="ml-1 text-gray-400">/5</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            {user.skills_text ? (
                              <Tooltip title={user.skills_text}>
                                <Typography 
                                  variant="body2" 
                                  className="text-gray-600 truncate max-w-[70%]"
                                  sx={{ fontStyle: 'italic' }}
                                >
                                  {user.skills_text}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <span></span>
                            )}
                            
                            <Button
                              variant="outlined"
                              color="primary"
                              endIcon={<ArrowForward />}
                              onClick={() => handleViewUserProfile(user.id)}
                              style={{ borderRadius: '2rem', textTransform: 'none' }}
                              size="small"
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {/* Skill-based search */}
            <Paper elevation={0} className="p-6 mb-6 border border-gray-200 rounded-xl">
              <Typography variant="h6" className="text-gray-800 font-semibold mb-4">
                Find Talents by Skills
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Typography variant="subtitle2" className="text-gray-700 mb-3">
                    Search Method
                  </Typography>
                  <div className="flex space-x-3 mb-4">
                    <Button
                      variant={selectedSkills.length === 0 ? "contained" : "outlined"}
                      color="primary"
                      size="medium"
                      onClick={() => setSelectedSkills([])}
                      style={{ borderRadius: '0.5rem', textTransform: 'none' }}
                      className={selectedSkills.length === 0 ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Single Skill
                    </Button>
                    <Button
                      variant={selectedSkills.length > 0 ? "contained" : "outlined"}
                      color="primary"
                      size="medium"
                      onClick={() => {
                        if (selectedSkill && !selectedSkills.includes(selectedSkill)) {
                          setSelectedSkills([selectedSkill]);
                        } else if (selectedSkills.length === 0 && skills.length > 0) {
                          setSelectedSkills([skills[0].id]);
                        }
                      }}
                      style={{ borderRadius: '0.5rem', textTransform: 'none' }}
                      className={selectedSkills.length > 0 ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Multiple Skills (AND)
                    </Button>
                  </div>
                  
                  {selectedSkills.length === 0 ? (
                    // Single skill selector
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Select Skill</InputLabel>
                      <Select
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        label="Select Skill"
                        sx={{ borderRadius: '0.5rem' }}
                      >
                        {skills.map((skill) => (
                          <MenuItem key={skill.id} value={skill.id}>
                            <ListItemText 
                              primary={skill.name} 
                              secondary={skill.category_name}
                              primaryTypographyProps={{ style: { fontWeight: 500 } }}
                              secondaryTypographyProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    // Multiple skills selector
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Select Multiple Skills</InputLabel>
                      <Select
                        multiple
                        value={selectedSkills}
                        onChange={(e) => setSelectedSkills(e.target.value)}
                        input={<OutlinedInput label="Select Multiple Skills" sx={{ borderRadius: '0.5rem' }} />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((skillId) => (
                              <Chip 
                                key={skillId} 
                                label={getSkillName(skillId)} 
                                size="small"
                                sx={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {skills.map((skill) => (
                          <MenuItem key={skill.id} value={skill.id}>
                            <Checkbox checked={selectedSkills.indexOf(skill.id) > -1} />
                            <ListItemText 
                              primary={skill.name} 
                              secondary={skill.category_name}
                              primaryTypographyProps={{ style: { fontWeight: 500 } }}
                              secondaryTypographyProps={{ style: { fontSize: '0.75rem' } }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  <Typography variant="body2" className="text-gray-600 mt-2">
                    {selectedSkills.length > 0 
                      ? `Finding Talents with ALL ${selectedSkills.length} selected skills (AND search)`
                      : 'Find Talents with expertise in a specific skill'}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="subtitle2" className="text-gray-700 mb-3">
                    Minimum Proficiency Level
                  </Typography>
                  <div className="flex items-center mb-3">
                    <Rating
                      value={minProficiency}
                      onChange={(event, newValue) => {
                        setMinProficiency(newValue || 1);
                      }}
                      max={5}
                      size="large"
                    />
                    <Typography variant="body2" className="ml-2 text-gray-600">
                      ({minProficiency}/5)
                    </Typography>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 text-center text-xs text-gray-600 mb-6">
                    <div>Beginner</div>
                    <div>Basic</div>
                    <div>Intermediate</div>
                    <div>Advanced</div>
                    <div>Expert</div>
                  </div>
                  
                  <Typography variant="body2" className="text-gray-600">
                    Only Talents with at least this level of proficiency will be shown in results.
                  </Typography>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={selectedSkills.length === 0 ? handleSingleSkillSearch : handleMultiSkillSearch}
                  style={{ borderRadius: '0.5rem', textTransform: 'none', padding: '10px 24px' }}
                  className="bg-blue-600 hover:bg-blue-700"
                  startIcon={<Search />}
                  disabled={(!selectedSkill && selectedSkills.length === 0) || loading}
                >
                  {loading ? 'Searching...' : 'Find Talents...'}
                </Button>
              </div>
            </Paper>
            
            {users.length > 0 && (
              <>
                <Divider className="my-6" />
                
                <div className="mb-4">
                  <Typography variant="subtitle1" className="text-gray-700 font-medium">
                    {loading ? 'Searching...' : `${filteredUsers.length} ${filteredUsers.length === 1 ? 'Talent' : 'Talents'} Found`}
                  </Typography>
                  {selectedSkill && !selectedSkills.length && (
                    <Typography variant="body2" className="text-gray-600">
                      Showing Talents with <strong>{getSkillName(selectedSkill)}</strong> (min. level: {minProficiency})
                    </Typography>
                  )}
                  {selectedSkills.length > 0 && (
                    <Typography variant="body2" className="text-gray-600">
                      Showing Talents with <strong>all {selectedSkills.length} selected skills</strong> (min. level: {minProficiency})
                    </Typography>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <CircularProgress />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Psychology className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Talents found with these skills
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-4 max-w-md mx-auto">
                      Try adjusting your skill selection or lowering the minimum proficiency level
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setMinProficiency(Math.max(1, minProficiency - 1))}
                      style={{ borderRadius: '0.5rem', textTransform: 'none', marginRight: '8px' }}
                      disabled={minProficiency === 1}
                    >
                      Lower Proficiency
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setSelectedSkill('');
                        setSelectedSkills([]);
                      }}
                      style={{ borderRadius: '0.5rem', textTransform: 'none' }}
                    >Reset Skills
                    </Button>
                  </div>
                ) : (
                  <Grid container spacing={3}>
                    {filteredUsers.map((user) => (
                      <Grid item xs={12} md={6} key={user.id}>
                        <Card className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
                          <CardContent className="p-0">
                            <div className="p-4 flex items-center space-x-4">
                              <Avatar 
                                alt={user.name || 'User'}
                                sx={{ width: 64, height: 64, bgcolor: '#3b82f6' }}
                              >
                                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                              </Avatar>
                              <div className="flex-1 overflow-hidden">
                                <Typography variant="h6" className="font-semibold text-gray-800 truncate">
                                  {user.name || user.username || 'Unnamed User'}
                                </Typography>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                  {user.email && (
                                    <div className="flex items-center text-gray-600 text-sm">
                                      <Email fontSize="small" className="mr-1 flex-shrink-0" />
                                      <span className="truncate">{user.email}</span>
                                    </div>
                                  )}
                                  {user.phone && (
                                    <div className="flex items-center text-gray-600 text-sm">
                                      <Phone fontSize="small" className="mr-1 flex-shrink-0" />
                                      <span className="truncate">{user.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Divider />
                            
                            <div className="p-4 bg-gray-50">
                              <div className="grid grid-cols-3 gap-3 mb-3">
                                <div>
                                  <Typography variant="caption" className="text-gray-500 block">Skills</Typography>
                                  <div className="flex items-center">
                                    <Badge className="mr-1.5 text-blue-600" />
                                    <Typography variant="body2" className="font-medium">
                                      {user.skills_count || 0}
                                    </Typography>
                                  </div>
                                </div>
                                <div>
                                  <Typography variant="caption" className="text-gray-500 block">Expert In</Typography>
                                  <div className="flex items-center">
                                    <Stars className="mr-1.5 text-amber-500" />
                                    <Typography variant="body2" className="font-medium">
                                      {user.expert_skills_count || 0}
                                    </Typography>
                                  </div>
                                </div>
                                <div>
                                  <Typography variant="caption" className="text-gray-500 block">Avg. Level</Typography>
                                  <div className="flex items-center">
                                    <Typography variant="body2" className="font-medium">
                                      {user.avg_proficiency 
                                        ? Math.round(user.avg_proficiency * 10) / 10 
                                        : 'N/A'}
                                    </Typography>
                                    <span className="ml-1 text-gray-400">/5</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                {user.skills_text ? (
                                  <Tooltip title={user.skills_text}>
                                    <Typography 
                                      variant="body2" 
                                      className="text-gray-600 truncate max-w-[70%]"
                                      sx={{ fontStyle: 'italic' }}
                                    >
                                      {user.skills_text}
                                    </Typography>
                                  </Tooltip>
                                ) : (
                                  <span></span>
                                )}
                                
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  endIcon={<ArrowForward />}
                                  onClick={() => handleViewUserProfile(user.id)}
                                  style={{ borderRadius: '2rem', textTransform: 'none' }}
                                  size="small"
                                >
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </TabPanel>
        </div>
      </div>
      
      {/* User Profile Dialog */}
      <Dialog 
        open={userDetailsOpen} 
        onClose={() => setUserDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: '0.75rem' }
        }}
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <Typography variant="h6" component="div" className="font-semibold">
              Talent Profile
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setUserDetailsOpen(false)}
              style={{ borderRadius: '2rem', textTransform: 'none' }}
            >
              Close
            </Button>
          </div>
        </DialogTitle>
        
        <DialogContent dividers>
          {userDetailsLoading ? (
            <div className="flex justify-center py-8">
              <CircularProgress />
            </div>
          ) : selectedUser ? (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <Avatar 
                  alt={selectedUser.user.name || selectedUser.user.username || 'User'}
                  sx={{ width: 80, height: 80, bgcolor: '#3b82f6', mr: 3 }}
                >
                  {(selectedUser.user.name || selectedUser.user.username || 'U').charAt(0).toUpperCase()}
                </Avatar>
                
                <div className="flex-1">
                  <Typography variant="h5" className="font-semibold text-gray-800">
                    {selectedUser.user.name || selectedUser.user.username || 'Unnamed User'}
                  </Typography>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                    {selectedUser.user.username && (
                      <div className="flex items-center text-gray-700">
                        <Person fontSize="small" className="mr-2 text-gray-500" />
                        {selectedUser.user.username}
                      </div>
                    )}
                    
                    {selectedUser.user.address && (
                      <div className="flex items-center text-gray-700">
                        <LocationOn fontSize="small" className="mr-2 text-gray-500" />
                        {selectedUser.user.address}
                      </div>
                    )}
                    
                    {selectedUser.user.email && (
                      <div className="flex items-center text-gray-700">
                        <Email fontSize="small" className="mr-2 text-gray-500" />
                        {selectedUser.user.email}
                      </div>
                    )}
                    
                    {selectedUser.user.phone && (
                      <div className="flex items-center text-gray-700">
                        <Phone fontSize="small" className="mr-2 text-gray-500" />
                        {selectedUser.user.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-4 bg-gray-50 p-3 rounded-lg">
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">Total Skills</Typography>
                      <Typography variant="body2" className="font-medium">
                        {selectedUser.user.skills_count || 0}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">Average Proficiency</Typography>
                      <Typography variant="body2" className="font-medium">
                        {selectedUser.user.avg_proficiency 
                          ? Math.round(selectedUser.user.avg_proficiency * 10) / 10 
                          : 'N/A'}/5
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-gray-500 block">Member Since</Typography>
                      <Typography variant="body2" className="font-medium">
                        {moment(selectedUser.user.created_at).format('MMM YYYY')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs
                variant="scrollable"
                scrollButtons="auto"
                value={0}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label={<div className="flex items-center"><Psychology className="mr-2" />Skills Assessment</div>} 
                  id="tab-0"
                  aria-controls="tabpanel-0"
                />
                <Tab 
                  label={<div className="flex items-center"><Work className="mr-2" />Experience</div>} 
                  id="tab-1"
                  aria-controls="tabpanel-1"
                />
                <Tab 
                  label={<div className="flex items-center"><School className="mr-2" />Education</div>}
                  id="tab-2" 
                  aria-controls="tabpanel-2"
                />
              </Tabs>
              
              <div role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0">
                {/* Skills Overview */}
                {selectedUser.user.skills_text && (
                  <Paper elevation={0} className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                    <Typography variant="subtitle2" className="text-gray-700 mb-2 flex items-center">
                      <Assignment className="mr-2 text-blue-600" fontSize="small" />
                      Skills Overview
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 whitespace-pre-line">
                      {selectedUser.user.skills_text}
                    </Typography>
                  </Paper>
                )}
                
                {/* Assessed Skills */}
                <Typography variant="subtitle1" className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Psychology className="mr-2 text-blue-600" />
                  Skill Assessments
                </Typography>
                
                {selectedUser.skills.length === 0 ? (
                  <Paper elevation={0} className="p-5 border border-gray-200 rounded-lg text-center">
                    <Typography variant="body2" className="text-gray-500 italic">
                      No skills assessment data available for this Talent.
                    </Typography>
                  </Paper>
                ) : (
                  <div className="space-y-6">
                    {selectedUser.skills.map(category => (
                      <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 border-b border-gray-200 px-4 py-2">
                          <Typography variant="subtitle1" className="font-medium text-blue-800">
                            {category.name}
                          </Typography>
                        </div>
                        
                        <TableContainer>
                          <Table size="small">
                            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                              <TableRow>
                                <TableCell width="40%" sx={{ fontWeight: 500 }}>Skill</TableCell>
                                <TableCell width="40%" sx={{ fontWeight: 500 }}>Proficiency</TableCell>
                                <TableCell width="20%" sx={{ fontWeight: 500 }}>Last Updated</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {category.skills.map(skill => (
                                <TableRow key={skill.id} hover>
                                  <TableCell>
                                    <Typography variant="body2" className="font-medium">
                                      {skill.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      {renderProficiencyStars(skill.proficiency_level)}
                                      <Typography variant="body2" className="ml-2">
                                        ({skill.proficiency_level}/5)
                                      </Typography>
                                      {skill.proficiency_level >= 4 && (
                                        <Chip
                                          label="Expert"
                                          size="small"
                                          color="primary"
                                          sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                        />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption" className="text-gray-500">
                                      {moment(skill.assessed_at).format('MMM D, YYYY')}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Experience Section */}
                <div role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" className="mt-6">
                  <Typography variant="subtitle1" className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Work className="mr-2 text-green-600" />
                    Experience
                  </Typography>
                  
                  {selectedUser.user.experience ? (
                    <Paper elevation={0} className="p-4 border border-gray-200 rounded-lg">
                      <Typography variant="body2" className="text-gray-600 whitespace-pre-line">
                        {selectedUser.user.experience}
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper elevation={0} className="p-5 border border-gray-200 rounded-lg text-center">
                      <Typography variant="body2" className="text-gray-500 italic">
                        No experience information available.
                      </Typography>
                    </Paper>
                  )}
                </div>
                
                {/* Education Section */}
                <div role="tabpanel" id="tabpanel-2" aria-labelledby="tab-2" className="mt-6">
                  <Typography variant="subtitle1" className="font-semibold text-gray-800 mb-3 flex items-center">
                    <School className="mr-2 text-purple-600" />
                    Education
                  </Typography>
                  
                  {selectedUser.user.education ? (
                    <Paper elevation={0} className="p-4 border border-gray-200 rounded-lg">
                      <Typography variant="body2" className="text-gray-600 whitespace-pre-line">
                        {selectedUser.user.education}
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper elevation={0} className="p-5 border border-gray-200 rounded-lg text-center">
                      <Typography variant="body2" className="text-gray-500 italic">
                        No education information available.
                      </Typography>
                    </Paper>
                  )}
                </div>
              </div>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" className="text-gray-500">
                  Member since {moment(selectedUser.user.created_at).format('MMMM D, YYYY')}
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Email />}
                  style={{ borderRadius: '0.5rem', textTransform: 'none' }}
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    window.location.href = `mailto:${selectedUser.user.email}?subject=Job Opportunity`;
                  }}
                  disabled={!selectedUser.user.email}
                >
                  Contact Talent
                </Button>
              </Box>
            </div>
          ) : (
            <div className="text-center py-8">
              <Typography variant="body2" className="text-gray-500 mb-3">
                User data not available. Please try again.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setUserDetailsOpen(false)}
                style={{ borderRadius: '0.5rem', textTransform: 'none' }}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EmployerTalentSearch;