import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Tabs, Tab, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Badge, Chip, Typography, 
  Box, Snackbar, Alert, CircularProgress, Switch, FormControlLabel,
  TablePagination, Select, MenuItem, FormControl, InputLabel, ListItemText,
  Checkbox, OutlinedInput
} from '@mui/material';
import { 
  Add, Edit, Delete, CheckCircle, Cancel, Search, 
  ArrowUpward, ArrowDownward, FilterList, Refresh,
  School, Category, Psychology, MenuBook, Link as LinkIcon
} from '@mui/icons-material';
import moment from 'moment';

// Custom tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

const AdminSkillsManagement = () => {
  // Tab management
  const [tabValue, setTabValue] = useState(0);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [trainingResources, setTrainingResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [skillForm, setSkillForm] = useState({ name: '', description: '', category_id: '' });
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    provider: '',
    description: '',
    link: '',
    resource_type: '',
    duration: '',
    cost: '',
    language: '',
    skill_ids: []
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Resource type options
  const resourceTypes = [
    'Course',
    'Video',
    'eBook',
    'Tutorial',
    'Webinar',
    'Documentation',
    'Article',
    'Certification',
    'Tool',
    'Other'
  ];
  
  // Language options
  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Russian',
    'Portuguese',
    'Arabic',
    'Other'
  ];

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchTerm.trim() === '') return;
    
    // Add filtering logic based on tab
  }, [searchTerm, tabValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesRes = await axios.get(`${API_URL}/admin/skills/categories`);
      setCategories(categoriesRes.data);
      
      // Fetch skills
      const skillsRes = await axios.get(`${API_URL}/admin/skills`);
      setSkills(skillsRes.data);
      
      // Fetch training resources
      const trainingRes = await axios.get(`${API_URL}/admin/training`);
      setTrainingResources(trainingRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbarMessage('Failed to load data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
    setPage(0);
  };

  // CATEGORY MANAGEMENT
  
  const handleCategoryDialogOpen = (category = null) => {
    if (category) {
      setCategoryForm({
        name: category.name,
        description: category.description || ''
      });
      setSelectedCategory(category);
      setIsEditing(true);
    } else {
      setCategoryForm({ name: '', description: '' });
      setSelectedCategory(null);
      setIsEditing(false);
    }
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setSnackbarMessage('Category name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      if (isEditing && selectedCategory) {
        // Update existing category
        await axios.put(`${API_URL}/admin/skills/categories/${selectedCategory.id}`, categoryForm);
        setSnackbarMessage('Category updated successfully');
      } else {
        // Create new category
        await axios.post(`${API_URL}/admin/skills/categories`, categoryForm);
        setSnackbarMessage('Category created successfully');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenCategoryDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to save category');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API_URL}/admin/skills/categories/${categoryId}`);
      setSnackbarMessage('Category deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to delete category');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // SKILL MANAGEMENT
  
  const handleSkillDialogOpen = (skill = null) => {
    if (skill) {
      setSkillForm({
        name: skill.name,
        description: skill.description || '',
        category_id: skill.category_id
      });
      setSelectedSkill(skill);
      setIsEditing(true);
    } else {
      setSkillForm({
        name: '',
        description: '',
        category_id: categories.length > 0 ? categories[0].id : ''
      });
      setSelectedSkill(null);
      setIsEditing(false);
    }
    setOpenSkillDialog(true);
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim() || !skillForm.category_id) {
      setSnackbarMessage('Skill name and category are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      if (isEditing && selectedSkill) {
        // Update existing skill
        await axios.put(`${API_URL}/admin/skills/${selectedSkill.id}`, skillForm);
        setSnackbarMessage('Skill updated successfully');
      } else {
        // Create new skill
        await axios.post(`${API_URL}/admin/skills`, skillForm);
        setSnackbarMessage('Skill created successfully');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenSkillDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving skill:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to save skill');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await axios.delete(`${API_URL}/admin/skills/${skillId}`);
      setSnackbarMessage('Skill deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchData();
    } catch (error) {
      console.error('Error deleting skill:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to delete skill');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // TRAINING RESOURCE MANAGEMENT
  
  const handleTrainingDialogOpen = (training = null) => {
    if (training) {
      setTrainingForm({
        title: training.title,
        provider: training.provider,
        description: training.description || '',
        link: training.link,
        resource_type: training.resource_type || '',
        duration: training.duration || '',
        cost: training.cost || '',
        language: training.language || '',
        skill_ids: training.skills ? training.skills.map(skill => skill.id) : []
      });
      setSelectedTraining(training);
      setIsEditing(true);
    } else {
      setTrainingForm({
        title: '',
        provider: '',
        description: '',
        link: '',
        resource_type: '',
        duration: '',
        cost: '',
        language: '',
        skill_ids: []
      });
      setSelectedTraining(null);
      setIsEditing(false);
    }
    setOpenTrainingDialog(true);
  };

  const handleSaveTraining = async () => {
    const { title, provider, link } = trainingForm;
    
    if (!title.trim() || !provider.trim() || !link.trim()) {
      setSnackbarMessage('Title, provider, and link are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      if (isEditing && selectedTraining) {
        // Update existing training resource
        await axios.put(`${API_URL}/admin/training/${selectedTraining.id}`, trainingForm);
        setSnackbarMessage('Training resource updated successfully');
      } else {
        // Create new training resource
        await axios.post(`${API_URL}/admin/training`, trainingForm);
        setSnackbarMessage('Training resource created successfully');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenTrainingDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving training resource:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to save training resource');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteTraining = async (trainingId) => {
    try {
      await axios.delete(`${API_URL}/admin/training/${trainingId}`);
      setSnackbarMessage('Training resource deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchData();
    } catch (error) {
      console.error('Error deleting training resource:', error);
      setSnackbarMessage(error.response?.data?.error || 'Failed to delete training resource');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // CONFIRMATION DIALOG
  
  const handleOpenConfirmation = (action, id, name) => {
    setConfirmationAction({ type: action, id, name });
    setConfirmationDialogOpen(true);
  };

  const handleConfirmAction = () => {
    const { type, id } = confirmationAction;
    
    switch (type) {
      case 'deleteCategory':
        handleDeleteCategory(id);
        break;
      case 'deleteSkill':
        handleDeleteSkill(id);
        break;
      case 'deleteTraining':
        handleDeleteTraining(id);
        break;
      default:
        console.error('Unknown action type:', type);
    }
    
    setConfirmationDialogOpen(false);
    setConfirmationAction(null);
  };

  // PAGINATION
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get skill name by ID
  const getSkillName = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Unknown';
  };

  // Filter functions for search
  const getFilteredCategories = () => {
    if (!searchTerm) return categories;
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getFilteredSkills = () => {
    if (!searchTerm) return skills;
    
    return skills.filter(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      skill.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredTrainings = () => {
    if (!searchTerm) return trainingResources;
    
    return trainingResources.filter(training => 
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      training.provider.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (training.description && training.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (training.resource_type && training.resource_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (training.language && training.language.toLowerCase().includes(searchTerm.toLowerCase())) ||
      // Check if any of the skills match the search term
      (training.skills && training.skills.some(skill => 
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                <span className="border-b-4 border-blue-500 pb-1">Skills & Training Management</span>
              </h1>
              <p className="text-gray-600 mt-2">Manage skill categories, individual skills, and training resources</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={fetchData}
                style={{ borderRadius: '0.5rem' }}
              >
                Refresh Data
              </Button>
            </div>
          </div>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="admin tabs"
              sx={{ '& .MuiTab-root': { fontWeight: 500, py: 2 } }}
            >
              <Tab 
                label={
                  <div className="flex items-center">
                    <Category className="mr-2 text-blue-500" fontSize="small" />
                    <span>Skill Categories</span>
                  </div>
                } 
              />
              <Tab 
                label={
                  <div className="flex items-center">
                    <Psychology className="mr-2 text-green-500" fontSize="small" />
                    <span>Skills</span>
                  </div>
                }
              />
              <Tab 
                label={
                  <div className="flex items-center">
                    <School className="mr-2 text-purple-500" fontSize="small" />
                    <span>Training Resources</span>
                  </div>
                }
              />
            </Tabs>
          </Box>
          
          {/* Search bar */}
          <div className="flex justify-between items-center my-4">
            <div className="relative w-full md:w-64">
              <TextField
                placeholder={`Search ${tabValue === 0 ? 'categories' : tabValue === 1 ? 'skills' : 'training resources'}...`}
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  style: { borderRadius: '0.5rem' }
                }}
              />
            </div>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                if (tabValue === 0) handleCategoryDialogOpen();
                else if (tabValue === 1) handleSkillDialogOpen();
                else handleTrainingDialogOpen();
              }}
              className="bg-blue-600 hover:bg-blue-700"
              style={{ textTransform: 'none', borderRadius: '0.5rem' }}
            >
              Add {tabValue === 0 ? 'Category' : tabValue === 1 ? 'Skill' : 'Training Resource'}
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <CircularProgress />
            </div>
          ) : (
            <>
              {/* Skill Categories Tab */}
              <TabPanel value={tabValue} index={0}>
                {getFilteredCategories().length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Category className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {searchTerm ? 'No categories match your search' : 'No skill categories yet'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      {searchTerm ? 'Try a different search term' : 'Create your first skill category to get started'}
                    </Typography>
                    {!searchTerm && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => handleCategoryDialogOpen()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Category
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                          <TableRow>
                            <TableCell width="30%">Name</TableCell>
                            <TableCell width="40%">Description</TableCell>
                            <TableCell width="15%">Skills</TableCell>
                            <TableCell width="15%" align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFilteredCategories()
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((category) => (
                              <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                                <TableCell>
                                  <Typography variant="subtitle2" className="font-semibold text-gray-800">
                                    {category.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" className="text-gray-600">
                                    {category.description || '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={category.skills_count || 0}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleCategoryDialogOpen(category)}
                                    title="Edit category"
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenConfirmation('deleteCategory', category.id, category.name)}
                                    title="Delete category"
                                    disabled={category.skills_count > 0}
                                  >
                                    <Delete />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <TablePagination
                      component="div"
                      count={getFilteredCategories().length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                  </>
                )}
              </TabPanel>
              
              {/* Skills Tab */}
              <TabPanel value={tabValue} index={1}>
                {getFilteredSkills().length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Psychology className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {searchTerm ? 'No skills match your search' : 'No skills yet'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      {searchTerm 
                        ? 'Try a different search term' 
                        : categories.length === 0 
                          ? 'Create a skill category first' 
                          : 'Add skills to your categories'
                      }
                    </Typography>
                    {!searchTerm && categories.length > 0 && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => handleSkillDialogOpen()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Skill
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                          <TableRow>
                            <TableCell width="25%">Name</TableCell>
                            <TableCell width="35%">Description</TableCell>
                            <TableCell width="20%">Category</TableCell>
                            <TableCell width="10%">Users</TableCell>
                            <TableCell width="10%" align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFilteredSkills()
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((skill) => (
                              <TableRow key={skill.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                                <TableCell>
                                  <Typography variant="subtitle2" className="font-semibold text-gray-800">
                                    {skill.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" className="text-gray-600">
                                    {skill.description || '-'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={skill.category_name}
                                    size="small"
                                    sx={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 500 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={skill.users_count || 0}
                                    color={skill.users_count > 0 ? "success" : "default"}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleSkillDialogOpen(skill)}
                                    title="Edit skill"
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenConfirmation('deleteSkill', skill.id, skill.name)}
                                    title="Delete skill"
                                    disabled={skill.users_count > 0}
                                  >
                                    <Delete />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <TablePagination
                      component="div"
                      count={getFilteredSkills().length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                  </>
                )}
              </TabPanel>
              
              {/* Training Resources Tab */}
              <TabPanel value={tabValue} index={2}>
                {getFilteredTrainings().length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {searchTerm ? 'No training resources match your search' : 'No training resources yet'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-4">
                      {searchTerm ? 'Try a different search term' : 'Add training resources to help users improve their skills'}
                    </Typography>
                    {!searchTerm && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => handleTrainingDialogOpen()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Training Resource
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                          <TableRow>
                            <TableCell width="25%">Title</TableCell>
                            <TableCell width="15%">Provider</TableCell>
                            <TableCell width="15%">Type</TableCell>
                            <TableCell width="25%">Skills</TableCell>
                            <TableCell width="10%">Link</TableCell>
                            <TableCell width="10%" align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFilteredTrainings()
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((training) => (
                              <TableRow key={training.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                                <TableCell>
                                  <Typography variant="subtitle2" className="font-semibold text-gray-800">
                                    {training.title}
                                  </Typography>
                                  {training.description && (
                                    <Typography variant="caption" className="text-gray-500 block mt-1">
                                      {training.description.length > 80 ? `${training.description.substring(0, 80)}...` : training.description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" className="text-gray-600">
                                    {training.provider}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {training.resource_type ? (
                                    <Chip 
                                    label={training.resource_type}
                                    size="small"
                                    sx={{ backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 500 }}
                                  />
                                ) : (
                                  <Typography variant="body2" className="text-gray-500">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {training.skills && training.skills.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {training.skills.slice(0, 3).map(skill => (
                                      <Chip 
                                        key={skill.id}
                                        label={skill.name}
                                        size="small"
                                        sx={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem' }}
                                      />
                                    ))}
                                    {training.skills.length > 3 && (
                                      <Chip 
                                        label={`+${training.skills.length - 3} more`}
                                        size="small"
                                        sx={{ backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <Typography variant="body2" className="text-gray-500">
                                    No skills associated
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <a 
                                  href={training.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <IconButton size="small" color="primary">
                                    <LinkIcon fontSize="small" />
                                  </IconButton>
                                </a>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleTrainingDialogOpen(training)}
                                  title="Edit training resource"
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenConfirmation('deleteTraining', training.id, training.title)}
                                  title="Delete training resource"
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    component="div"
                    count={getFilteredTrainings().length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </>
              )}
            </TabPanel>
          </>
        )}
      </div>
    </div>
    
    {/* Category Dialog */}
    <Dialog 
      open={openCategoryDialog} 
      onClose={() => setOpenCategoryDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { borderRadius: '0.75rem' }
      }}
    >
      <DialogTitle>
        <div className="flex items-center text-gray-800">
          <Category className="mr-2 text-blue-500" />
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </div>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Category Name"
          type="text"
          fullWidth
          value={categoryForm.name}
          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
          required
          variant="outlined"
          className="mb-4"
          sx={{ mt: 2 }}
          InputProps={{
            style: { borderRadius: '0.5rem' }
          }}
        />
        <TextField
          margin="dense"
          label="Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={categoryForm.description}
          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
          variant="outlined"
          InputProps={{
            style: { borderRadius: '0.5rem' }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setOpenCategoryDialog(false)}
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveCategory}
          variant="contained" 
          color="primary"
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? 'Update Category' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Skill Dialog */}
    <Dialog 
      open={openSkillDialog} 
      onClose={() => setOpenSkillDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { borderRadius: '0.75rem' }
      }}
    >
      <DialogTitle>
        <div className="flex items-center text-gray-800">
          <Psychology className="mr-2 text-green-500" />
          {isEditing ? 'Edit Skill' : 'Add New Skill'}
        </div>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Skill Name"
          type="text"
          fullWidth
          value={skillForm.name}
          onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
          required
          variant="outlined"
          className="mb-4"
          sx={{ mt: 2 }}
          InputProps={{
            style: { borderRadius: '0.5rem' }
          }}
        />
        <TextField
          margin="dense"
          label="Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={skillForm.description}
          onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}
          variant="outlined"
          className="mb-4"
          InputProps={{
            style: { borderRadius: '0.5rem' }
          }}
        />
        <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={skillForm.category_id}
            onChange={(e) => setSkillForm({...skillForm, category_id: e.target.value})}
            label="Category"
            required
            sx={{ borderRadius: '0.5rem' }}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setOpenSkillDialog(false)}
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveSkill}
          variant="contained" 
          color="primary"
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? 'Update Skill' : 'Add Skill'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Training Resource Dialog */}
    <Dialog 
      open={openTrainingDialog} 
      onClose={() => setOpenTrainingDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { borderRadius: '0.75rem' }
      }}
    >
      <DialogTitle>
        <div className="flex items-center text-gray-800">
          <School className="mr-2 text-purple-500" />
          {isEditing ? 'Edit Training Resource' : 'Add New Training Resource'}
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={trainingForm.title}
            onChange={(e) => setTrainingForm({...trainingForm, title: e.target.value})}
            required
            variant="outlined"
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
          <TextField
            margin="dense"
            label="Provider"
            type="text"
            fullWidth
            value={trainingForm.provider}
            onChange={(e) => setTrainingForm({...trainingForm, provider: e.target.value})}
            required
            variant="outlined"
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
        </div>
        
        <TextField
          margin="dense"
          label="Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={trainingForm.description}
          onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
          variant="outlined"
          className="my-2"
          InputProps={{
            style: { borderRadius: '0.5rem' }
          }}
        />
        
        <TextField
          margin="dense"
          label="Link to Resource"
          type="url"
          fullWidth
          value={trainingForm.link}
          onChange={(e) => setTrainingForm({...trainingForm, link: e.target.value})}
          required
          variant="outlined"
          className="mb-4"
          InputProps={{
            style: { borderRadius: '0.5rem' }
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormControl fullWidth variant="outlined" sx={{ my: 1 }}>
            <InputLabel>Resource Type</InputLabel>
            <Select
              value={trainingForm.resource_type}
              onChange={(e) => setTrainingForm({...trainingForm, resource_type: e.target.value})}
              label="Resource Type"
              sx={{ borderRadius: '0.5rem' }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {resourceTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ my: 1 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={trainingForm.language}
              onChange={(e) => setTrainingForm({...trainingForm, language: e.target.value})}
              label="Language"
              sx={{ borderRadius: '0.5rem' }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {languages.map(lang => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            margin="dense"
            label="Duration (e.g., '2 hours', '4 weeks')"
            type="text"
            fullWidth
            value={trainingForm.duration}
            onChange={(e) => setTrainingForm({...trainingForm, duration: e.target.value})}
            variant="outlined"
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
          
          <TextField
            margin="dense"
            label="Cost (e.g., 'Free', '$49.99')"
            type="text"
            fullWidth
            value={trainingForm.cost}
            onChange={(e) => setTrainingForm({...trainingForm, cost: e.target.value})}
            variant="outlined"
            InputProps={{
              style: { borderRadius: '0.5rem' }
            }}
          />
        </div>
        
        <FormControl fullWidth variant="outlined" sx={{ mt: 3 }}>
          <InputLabel>Associated Skills</InputLabel>
          <Select
            multiple
            value={trainingForm.skill_ids}
            onChange={(e) => setTrainingForm({...trainingForm, skill_ids: e.target.value})}
            input={<OutlinedInput label="Associated Skills" sx={{ borderRadius: '0.5rem' }} />}
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
                <Checkbox checked={trainingForm.skill_ids.indexOf(skill.id) > -1} />
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
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setOpenTrainingDialog(false)}
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveTraining}
          variant="contained" 
          color="primary"
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? 'Update Resource' : 'Add Resource'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Confirmation Dialog */}
    <Dialog
      open={confirmationDialogOpen}
      onClose={() => setConfirmationDialogOpen(false)}
      PaperProps={{
        style: { borderRadius: '0.75rem' }
      }}
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete the {
            confirmationAction?.type === 'deleteCategory' ? 'category' :
            confirmationAction?.type === 'deleteSkill' ? 'skill' :
            'training resource'
          } <strong>{confirmationAction?.name}</strong>?
        </Typography>
        {confirmationAction?.type === 'deleteCategory' && (
          <Typography variant="body2" color="error" className="mt-2">
            Note: You can only delete categories that have no skills associated with them.
          </Typography>
        )}
        {confirmationAction?.type === 'deleteSkill' && (
          <Typography variant="body2" color="error" className="mt-2">
            Note: You can only delete skills that are not used in any user's assessments.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setConfirmationDialogOpen(false)}
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmAction}
          variant="contained" 
          color="error"
          sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
        >
          Delete
        </Button>
      </DialogActions>
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

export default AdminSkillsManagement;