import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import API_URL from '../api';
import html2canvas from 'jspdf-html2canvas';
import jsPDF from 'jspdf';
import logoImage from '../assets/logo.jpg'; // Adjust the path to match your project structure
const Reports = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('user-overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  
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
// Enhanced PDF Export Functions for EmpowerLink Reports
// Add these functions to replace the existing exportToPDF function

const exportToPDF = async () => {
  setIsPdfExporting(true);
  
  try {
    // Load pdfMake if not already loaded
    if (typeof window !== 'undefined' && !window.pdfMake) {
      await new Promise((resolve, reject) => {
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
          script2.onload = resolve;
          script2.onerror = reject;
          document.head.appendChild(script2);
        };
        script1.onerror = reject;
        document.head.appendChild(script1);
      });
    }

    if (!window.pdfMake) {
      throw new Error('PDF library failed to load');
    }
    
    const reportTitle = getReportTitle(activeTab);
    const headerContent = await createProfessionalHeader(reportTitle);
    
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 40],
      
      header: {
        columns: [
          { text: 'EmpowerLink - Confidential Report', style: 'headerFooter' },
          { text: '', style: 'headerFooter' },
        ],
        margin: [40, 12]
      },
      
      footer: (currentPage, pageCount) => ({
        columns: [
          { text: '© 2025 EmpowerLink. All rights reserved.', style: 'headerFooter' },
          { text: '', style: 'headerFooter' },
          { text: `Page ${currentPage} of ${pageCount}`, style: 'headerFooter', alignment: 'right' }
        ],
        margin: [40, 12]
      }),

      content: [
        ...headerContent,
        ...createReportMetadata(),
        ...generateReportContent()
      ],

      styles: {
        bigCenterHeader: {
          fontSize: 26,
          bold: true,
          color: '#1e40af',
          margin: [0, 0, 0, 2]
        },
        companyAddress: {
          fontSize: 11,
          color: '#6B7280',
          margin: [0, 1, 0, 0]
        },
        companyTagline: {
          fontSize: 10,
          italics: true,
          color: '#9CA3AF'
        },
        headerInfoLabel: {
          fontSize: 9,
          color: '#6B7280',
          bold: true
        },
        headerInfoValue: {
          fontSize: 10,
          color: '#374151'
        },
        confidentialStamp: {
          fontSize: 10,
          bold: true,
          color: '#DC2626'
        },
        landscapeReportTitle: {
          fontSize: 20,
          bold: true,
          color: '#1e40af',
          alignment: 'center'
        },
        landscapeMetadata: {
          fontSize: 11,
          color: '#374151',
          lineHeight: 1.4
        },
        landscapeSubsectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#374151'
        },
        landscapeTableHeader: {
          fontSize: 10,
          bold: true
        },
        landscapeTableCell: {
          fontSize: 9
        },
        headerFooter: {
          fontSize: 8,
          color: '#6B7280'
        },
        noData: {
          fontSize: 14,
          alignment: 'center',
          color: '#6B7280',
          italics: true
        }
      },

      defaultStyle: {
        fontSize: 10,
        lineHeight: 1.2,
        color: '#374151'
      }
    };

    const fileName = `EmpowerLink_${activeTab}_${new Date().toISOString().split('T')[0]}_Report.pdf`;
    window.pdfMake.createPdf(docDefinition).download(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try again later.');
  } finally {
    setIsPdfExporting(false);
  }
};

// Enhanced logo loading from assets
const getEmpowerLinkLogo = async () => {
  try {
    // Try to load the imported logo first
    if (logoImage) {
      const response = await fetch(logoImage);
      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.type.startsWith('image/')) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              if (result && result.startsWith('data:image/')) {
                resolve(result);
              } else {
                reject(new Error('Invalid data URL format'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(blob);
          });
        }
      }
    }
  } catch (error) {
    console.log('Imported logo failed, trying public path:', error.message);
  }

  try {
    // Try public assets path
    const response = await fetch('/assets/logo.jpg');
    if (response.ok) {
      const blob = await response.blob();
      
      if (blob.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (result && result.startsWith('data:image/')) {
              resolve(result);
            } else {
              reject(new Error('Invalid data URL format'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch (error) {
    console.log('Public path logo failed:', error.message);
  }
  
  // Enhanced SVG fallback logo if image loading fails
  console.log('Using enhanced SVG fallback logo');
  const svgContent = `
    <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <rect width="150" height="60" fill="url(#logoGradient)" rx="12" filter="url(#shadow)"/>
      <text x="75" y="25" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="white">EMPOWER</text>
      <text x="75" y="42" font-family="Arial" font-size="10" text-anchor="middle" fill="white">LINK</text>
      <circle cx="25" cy="20" r="8" fill="white" opacity="0.3"/>
      <circle cx="125" cy="40" r="6" fill="white" opacity="0.2"/>
      <path d="M20 30 L30 35 L20 40 Z" fill="white" opacity="0.4"/>
      <path d="M120 25 L130 30 L120 35 Z" fill="white" opacity="0.3"/>
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svgContent);
};

// Professional header creation
const createProfessionalHeader = async (reportTitle) => {
  let logoBase64;
  try {
    logoBase64 = await getEmpowerLinkLogo();
  } catch (error) {
    console.log('Logo creation failed:', error.message);
    logoBase64 = null;
  }
  
  const headerColumns = [];
  
  // Logo section
  if (logoBase64) {
    headerColumns.push({
      width: 120,
      image: logoBase64,
      fit: [120, 60],
      margin: [0, 5, 0, 0]
    });
  } else {
    headerColumns.push({
      width: 120,
      text: ''
    });
  }
  
  // Company information
  headerColumns.push({
    width: '*',
    stack: [
      {
        text: 'EMPOWERLINK',
        style: 'bigCenterHeader',
        color: '#1e40af',
        alignment: 'center'
      },
      {
        text: 'Kigali, Rwanda',
        style: 'companyAddress',
        alignment: 'center',
        margin: [0, 2, 0, 0]
      },
      {
        text: 'Website: www.empowerlink.rw',
        style: 'companyAddress',
        alignment: 'center',
        margin: [0, 1, 0, 0]
      },
      {
        text: 'System Analytics and Performance Metrics',
        style: 'companyTagline',
        alignment: 'center',
        margin: [0, 3, 0, 0]
      }
    ]
  });
  
  // Report metadata
  headerColumns.push({
    width: 120,
    stack: [
      {
        text: 'Generated:',
        style: 'headerInfoLabel',
        alignment: 'right'
      },
      {
        text: getCurrentDateTime(),
        style: 'headerInfoValue',
        alignment: 'right',
        margin: [0, 1, 0, 3]
      },
      {
        text: 'Status:',
        style: 'headerInfoLabel',
        alignment: 'right'
      },
      {
        text: 'CONFIDENTIAL',
        style: 'confidentialStamp',
        alignment: 'right'
      }
    ]
  });
  
  return [
    {
      columns: headerColumns,
      margin: [0, 0, 0, 15]
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 750, y2: 0,
          lineWidth: 3,
          lineColor: '#1e40af'
        }
      ],
      margin: [0, 0, 0, 15]
    },
    {
      text: reportTitle,
      style: 'landscapeReportTitle',
      alignment: 'center',
      margin: [0, 10, 0, 20]
    }
  ];
};

// Get report title based on active tab
const getReportTitle = (tab) => {
  const titles = {
    'user-overview': 'User Overview Report',
    'job-market': 'Job Market Analysis Report',
    'skills-assessment': 'Skills Assessment Report',
    'community-engagement': 'Community Engagement Report'
  };
  return titles[tab] || 'EmpowerLink Report';
};

// Enhanced table creation
const createProfessionalTable = (headers, data, options = {}) => {
  const { 
    headerColor = '#1e40af',
    alternatingRows = true,
    fontSize = 10,
    widths = null 
  } = options;

  const tableContent = [
    {
      table: {
        headerRows: 1,
        widths: widths || Array(headers.length).fill('*'),
        body: [
          headers.map(header => ({
            text: header,
            style: 'landscapeTableHeader',
            fillColor: headerColor,
            color: 'white',
            bold: true,
            alignment: 'center'
          })),
          ...data.map((row, index) => 
            row.map(cell => ({
              text: cell || '-',
              style: 'landscapeTableCell',
              fillColor: alternatingRows && index % 2 === 0 ? '#F9FAFB' : 'white',
              alignment: typeof cell === 'string' && cell.includes('%') ? 'center' : 
                         cell && cell.toString().match(/^[\d,.\s]+$/) ? 'right' : 'left'
            }))
          )
        ]
      },
      layout: {
        hLineWidth: (i, node) => i === 0 || i === 1 || i === node.table.body.length ? 2 : 1,
        vLineWidth: () => 1,
        hLineColor: (i, node) => i === 0 || i === 1 ? headerColor : '#E5E7EB',
        vLineColor: () => '#E5E7EB',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6
      },
      fontSize: fontSize,
      margin: [0, 8, 0, 10]
    },
    {
      stack: [
        {
          text: 'Generated by: System Administrator',
          fontSize: 8,
          bold: true,
          color: '#6B7280',
          alignment: 'left',
          margin: [0, 5, 0, 1]
        },
        {
          text: getCurrentDateTime(),
          fontSize: 7,
          color: '#9CA3AF',
          italics: true,
          alignment: 'left'
        }
      ],
      margin: [0, 0, 0, 15]
    }
  ];

  return tableContent;
};

// Generate report metadata
const createReportMetadata = () => {
  const metadata = [];
  
  if (startDate || endDate) {
    let dateText = 'Date Range: ';
    if (startDate && endDate) {
      dateText += `${startDate} to ${endDate}`;
    } else if (startDate) {
      dateText += `From ${startDate}`;
    } else if (endDate) {
      dateText += `Until ${endDate}`;
    }
    metadata.push(`📅 ${dateText}`);
  }
  
  if (searchTerm) {
    metadata.push(`🔍 Search Filter: "${searchTerm}"`);
  }

  if (metadata.length > 0) {
    return [
      {
        table: {
          widths: ['*'],
          body: [[{
            ul: metadata,
            style: 'landscapeMetadata',
            fillColor: '#F8F9FA',
            margin: [12, 10, 12, 10]
          }]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#D1D5DB',
          vLineColor: () => '#D1D5DB'
        },
        margin: [0, 0, 0, 15]
      }
    ];
  }
  return [];
};

// Generate report content based on active tab
const generateReportContent = () => {
  switch (activeTab) {
    case 'user-overview':
      return generateUserOverviewPDF();
    case 'job-market':
      return generateJobMarketPDF();
    case 'skills-assessment':
      return generateSkillsAssessmentPDF();
    case 'community-engagement':
      return generateCommunityEngagementPDF();
    default:
      return [{ text: 'No data available for this report type.', style: 'noData', margin: [0, 20] }];
  }
};

// User Overview PDF content
const generateUserOverviewPDF = () => {
  const { usersByRole, recentUsers, usersBySkillCategory } = reportData;
  
  if (!usersByRole) {
    return [{ text: 'No data available for User Overview.', style: 'noData', margin: [0, 20] }];
  }
  
  const content = [];
  
  // Users by Role Section
  content.push(
    { text: 'Users by Role Distribution', style: 'landscapeSubsectionHeader', margin: [0, 5, 0, 12] },
    ...createProfessionalTable(
      ['Role', 'Count', 'Percentage'],
      usersByRole.map(role => {
        const total = usersByRole.reduce((sum, r) => sum + r.count, 0);
        const percentage = Math.round((role.count / total) * 100);
        return [
          role.role.charAt(0).toUpperCase() + role.role.slice(1),
          role.count.toString(),
          `${percentage}%`
        ];
      }),
      { widths: ['40%', '30%', '30%'], headerColor: '#1e40af' }
    )
  );
  
  // Recent Users Section
  if (recentUsers && recentUsers.length > 0) {
    content.push(
      { text: 'Recent User Registrations', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Name', 'Email', 'Role', 'Registration Date'],
        recentUsers.slice(0, 10).map(user => [
          user.name,
          user.email,
          user.role.charAt(0).toUpperCase() + user.role.slice(1),
          new Date(user.created_at).toLocaleDateString()
        ]),
        { widths: ['25%', '35%', '20%', '20%'], headerColor: '#059669' }
      )
    );
  }
  
  // Skills Distribution Section
  if (usersBySkillCategory && usersBySkillCategory.length > 0) {
    content.push(
      { text: 'Skills Category Distribution', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Skill Category', 'User Count', 'Percentage'],
        usersBySkillCategory.map(category => {
          const total = usersBySkillCategory.reduce((sum, c) => sum + c.user_count, 0);
          const percentage = Math.round((category.user_count / total) * 100);
          return [
            category.category_name,
            category.user_count.toString(),
            `${percentage}%`
          ];
        }),
        { widths: ['50%', '25%', '25%'], headerColor: '#7c3aed' }
      )
    );
  }
  
  return content;
};

// Job Market PDF content
const generateJobMarketPDF = () => {
  const { totalJobs, jobsByLocation, applicationStats } = reportData;
  
  if (!totalJobs) {
    return [{ text: 'No data available for Job Market.', style: 'noData', margin: [0, 20] }];
  }
  
  const content = [];
  
  // Job Overview
  content.push(
    { text: 'Job Market Overview', style: 'landscapeSubsectionHeader', margin: [0, 5, 0, 12] },
    ...createProfessionalTable(
      ['Metric', 'Value', 'Status'],
      [
        ['Total Jobs', totalJobs.total_jobs?.toString() || '0', '100%'],
        ['Active Jobs', totalJobs.active_jobs?.toString() || '0', `${Math.round((totalJobs.active_jobs / totalJobs.total_jobs) * 100) || 0}%`],
        ['Inactive Jobs', (totalJobs.total_jobs - totalJobs.active_jobs).toString(), `${Math.round(((totalJobs.total_jobs - totalJobs.active_jobs) / totalJobs.total_jobs) * 100) || 0}%`]
      ],
      { widths: ['40%', '30%', '30%'], headerColor: '#dc2626' }
    )
  );
  
  // Top Locations
  if (jobsByLocation && jobsByLocation.length > 0) {
    content.push(
      { text: 'Jobs by Location', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Location', 'Job Count', 'Percentage'],
        jobsByLocation.slice(0, 10).map(location => {
          const total = jobsByLocation.reduce((sum, l) => sum + l.job_count, 0);
          const percentage = Math.round((location.job_count / total) * 100);
          return [
            location.location,
            location.job_count.toString(),
            `${percentage}%`
          ];
        }),
        { widths: ['50%', '25%', '25%'], headerColor: '#059669' }
      )
    );
  }
  
  // Application Statistics
  if (applicationStats) {
    content.push(
      { text: 'Application Statistics', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Status', 'Count', 'Percentage'],
        [
          ['Total Applications', applicationStats.total_applications?.toString() || '0', '100%'],
          ['Accepted', applicationStats.accepted_applications?.toString() || '0', `${Math.round((applicationStats.accepted_applications / applicationStats.total_applications) * 100) || 0}%`],
          ['Pending', applicationStats.pending_applications?.toString() || '0', `${Math.round((applicationStats.pending_applications / applicationStats.total_applications) * 100) || 0}%`],
          ['Rejected', (applicationStats.total_applications - applicationStats.accepted_applications - applicationStats.pending_applications).toString(), `${Math.round(((applicationStats.total_applications - applicationStats.accepted_applications - applicationStats.pending_applications) / applicationStats.total_applications) * 100) || 0}%`]
        ],
        { widths: ['40%', '30%', '30%'], headerColor: '#f59e0b' }
      )
    );
  }
  
  return content;
};

// Skills Assessment PDF content
const generateSkillsAssessmentPDF = () => {
  const { commonSkills, skillGap, topSkilledUsers } = reportData;
  
  if (!commonSkills) {
    return [{ text: 'No data available for Skills Assessment.', style: 'noData', margin: [0, 20] }];
  }
  
  const content = [];
  
  // Most Common Skills
  if (commonSkills.length > 0) {
    content.push(
      { text: 'Most Common Skills', style: 'landscapeSubsectionHeader', margin: [0, 5, 0, 12] },
      ...createProfessionalTable(
        ['Skill Name', 'User Count', 'Percentage'],
        commonSkills.slice(0, 10).map(skill => {
          const total = commonSkills.reduce((sum, s) => sum + s.user_count, 0);
          const percentage = Math.round((skill.user_count / total) * 100);
          return [
            skill.skill_name,
            skill.user_count.toString(),
            `${percentage}%`
          ];
        }),
        { widths: ['50%', '25%', '25%'], headerColor: '#06b6d4' }
      )
    );
  }
  
  // Skills Gap Analysis
  if (skillGap && skillGap.length > 0) {
    content.push(
      { text: 'Skills Demand-Supply Gap Analysis', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Skill', 'Demand', 'Supply', 'Gap', 'Gap Type'],
        skillGap.slice(0, 10).map(skill => [
          skill.skill_name,
          skill.demand_count?.toString() || '0',
          skill.supply_count?.toString() || '0',
          Math.abs(skill.gap)?.toString() || '0',
          skill.gap > 0 ? 'Shortage' : skill.gap < 0 ? 'Surplus' : 'Balanced'
        ]),
        { widths: ['25%', '15%', '15%', '15%', '30%'], headerColor: '#dc2626' }
      )
    );
  }
  
  // Top Skilled Users
  if (topSkilledUsers && topSkilledUsers.length > 0) {
    content.push(
      { text: 'Top Skilled Users', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Name', 'Average Rating', 'Skills Count', 'Expertise Level'],
        topSkilledUsers.slice(0, 10).map(user => [
          user.name,
          `${user.avg_proficiency}/5`,
          user.skills_count?.toString() || '0',
          user.avg_proficiency >= 4 ? 'Expert' : user.avg_proficiency >= 3 ? 'Advanced' : 'Intermediate'
        ]),
        { widths: ['35%', '20%', '20%', '25%'], headerColor: '#7c3aed' }
      )
    );
  }
  
  return content;
};

// Community Engagement PDF content
const generateCommunityEngagementPDF = () => {
  const { forumActivity, successStories, popularTopics } = reportData;
  
  if (!forumActivity) {
    return [{ text: 'No data available for Community Engagement.', style: 'noData', margin: [0, 20] }];
  }
  
  const content = [];
  
  // Forum Activity Overview
  content.push(
    { text: 'Forum Activity Overview', style: 'landscapeSubsectionHeader', margin: [0, 5, 0, 12] },
    ...createProfessionalTable(
      ['Metric', 'Value', 'Status'],
      [
        ['Total Topics', forumActivity.total_topics?.toString() || '0', 'Active'],
        ['Total Posts', forumActivity.total_posts?.toString() || '0', 'Active'],
        ['Active Users', forumActivity.active_users?.toString() || '0', 'Engaged'],
        ['Avg Posts per Topic', forumActivity.total_topics > 0 ? Math.round(forumActivity.total_posts / forumActivity.total_topics).toString() : '0', 'Calculated']
      ],
      { widths: ['40%', '30%', '30%'], headerColor: '#8b5cf6' }
    )
  );
  
  // Success Stories
  if (successStories) {
    content.push(
      { text: 'Success Stories Statistics', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Metric', 'Count', 'Percentage'],
        [
          ['Total Stories', successStories.total_stories?.toString() || '0', '100%'],
          ['Approved Stories', successStories.approved_stories?.toString() || '0', `${Math.round((successStories.approved_stories / successStories.total_stories) * 100) || 0}%`],
          ['Pending Stories', (successStories.total_stories - successStories.approved_stories).toString(), `${Math.round(((successStories.total_stories - successStories.approved_stories) / successStories.total_stories) * 100) || 0}%`]
        ],
        { widths: ['40%', '30%', '30%'], headerColor: '#f59e0b' }
      )
    );
  }
  
  // Popular Topics
  if (popularTopics && popularTopics.length > 0) {
    content.push(
      { text: 'Most Popular Discussion Topics', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 12] },
      ...createProfessionalTable(
        ['Topic Title', 'Post Count', 'Last Activity', 'Engagement Level'],
        popularTopics.slice(0, 10).map(topic => [
          topic.title,
          topic.post_count?.toString() || '0',
          new Date(topic.last_activity).toLocaleDateString(),
          topic.post_count >= 20 ? 'High' : topic.post_count >= 10 ? 'Medium' : 'Low'
        ]),
        { widths: ['45%', '15%', '20%', '20%'], headerColor: '#059669' }
      )
    );
  }
  
  return content;
};

// Utility function for current date/time
const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};
 
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
          <div className="bg-blue-900 px-6 py-4 text-white">
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
                  onClick={exportToPDF}
                  disabled={isPdfExporting || loading}
                  className={`${
                    isPdfExporting || loading 
                      ? 'bg-green-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-4 py-2 rounded-md flex items-center`}
                >
                  {isPdfExporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export PDF
                    </>
                  )}
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

export default Reports;