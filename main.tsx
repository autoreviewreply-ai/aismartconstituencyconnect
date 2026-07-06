/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  PlusCircle, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  User, 
  Shield, 
  BarChart3, 
  Search, 
  Filter, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Briefcase, 
  Sparkles, 
  Building, 
  RefreshCw, 
  AlertCircle, 
  FileCheck,
  ChevronRight,
  Info,
  Calendar,
  Send,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react';
import { 
  Complaint, 
  Category, 
  PriorityLevel, 
  ComplaintStatus, 
  AnalyticsSummary, 
  PlanningReport 
} from './types';

// Preset mock images to easily populate when filing complaints for high-quality demos
const PRESET_DEMO_IMAGES = [
  {
    name: 'Water Leak',
    url: 'https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=400',
    category: 'Water Supply' as Category,
    title: 'Burst water main in suburban cul-de-sac'
  },
  {
    name: 'Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400',
    category: 'Roads & Traffic' as Category,
    title: 'Severe trench pothole near highway exit'
  },
  {
    name: 'Overflowing Trash',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400',
    category: 'Sanitation & Waste' as Category,
    title: 'Neglected garbage container behind municipal park'
  },
  {
    name: 'Broken Light',
    url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=400',
    category: 'Streetlights & Electricity' as Category,
    title: 'Flickering streetlights creating safety dead-zone'
  }
];

export default function App() {
  // Global State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'citizen-view' | 'citizen-file' | 'officer-dashboard' | 'analytics-planning'>('citizen-view');
  const [userRole, setUserRole] = useState<'Citizen' | 'Municipal Officer' | 'Planning Director'>('Citizen');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  
  // Loading & Action states
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [activeReport, setActiveReport] = useState<PlanningReport | null>(null);
  
  // Selected single complaint for deep-dive detail modal/panel
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Duplicate check feedback
  const [dupCheckLoading, setDupCheckLoading] = useState(false);
  const [dupCheckResult, setDupCheckResult] = useState<{
    isDuplicate: boolean;
    duplicateOfId: string | null;
    similarityPercentage: number;
    reasoning: string;
  } | null>(null);

  // New Comment input
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  // Officer action form state
  const [officerStatusUpdate, setOfficerStatusUpdate] = useState<ComplaintStatus | ''>('');
  const [officerDeptUpdate, setOfficerDeptUpdate] = useState('');
  const [officerInternalNote, setOfficerInternalNote] = useState('');
  const [officerActionLoading, setOfficerActionLoading] = useState(false);

  // New Complaint Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Roads & Traffic');
  const [newWard, setNewWard] = useState('Ward 7 - Riverside');
  const [newLat, setNewLat] = useState('37.7749');
  const [newLng, setNewLng] = useState('-122.4194');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newImageBase64, setNewImageBase64] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [showFormSuccessAlert, setShowFormSuccessAlert] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchComplaints();
    fetchAnalytics();
  }, []);

  // Sync state if selectedComplaint is updated
  useEffect(() => {
    if (selectedComplaint) {
      setOfficerStatusUpdate(selectedComplaint.status);
      setOfficerDeptUpdate(selectedComplaint.aiAssignedDepartment);
      setDupCheckResult(null);
    }
  }, [selectedComplaint]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = '/api/complaints';
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (searchQuery) params.append('q', searchQuery);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const handleSearchAndFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
    setTimeout(() => {
      fetchComplaints();
    }, 50);
  };

  const handleUpvote = async (complaintId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const mockEmail = newContactEmail || 'citizen.connect@civic.org';
    try {
      const res = await fetch(`/api/complaints/${complaintId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mockEmail })
      });
      const data = await res.json();
      
      // Update local states
      setComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            upvotes: data.upvotes,
            votedUserEmails: data.upvoted 
              ? [...c.votedUserEmails, mockEmail] 
              : c.votedUserEmails.filter(email => email !== mockEmail)
          };
        }
        return c;
      }));

      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint(prev => {
          if (!prev) return null;
          return {
            ...prev,
            upvotes: data.upvotes,
            votedUserEmails: data.upvoted 
              ? [...prev.votedUserEmails, mockEmail] 
              : prev.votedUserEmails.filter(email => email !== mockEmail)
          };
        });
      }
      
      fetchAnalytics();
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !commentText.trim() || !commentAuthor.trim()) return;

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: commentAuthor,
          text: commentText,
          isInternal: userRole !== 'Citizen'
        })
      });
      const newComment = await res.json();
      
      setSelectedComplaint(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          comments: [...prev.comments, newComment],
          logs: [
            ...prev.logs,
            {
              id: 'log-new',
              title: userRole !== 'Citizen' ? 'Internal Note Added' : 'Public Comment Published',
              description: `Comment posted by ${commentAuthor}.`,
              timestamp: new Date().toISOString(),
              authorName: commentAuthor
            }
          ]
        };
        // sync main complaints list
        setComplaints(list => list.map(c => c.id === prev.id ? updated : c));
        return updated;
      });

      setCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleOfficerActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setOfficerActionLoading(true);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: officerStatusUpdate,
          officerName: commentAuthor || 'Officer Mitchell',
          assignedDepartment: officerDeptUpdate,
          commentText: officerInternalNote.trim() || undefined
        })
      });
      const updatedComplaint = await res.json();
      
      setSelectedComplaint(updatedComplaint);
      setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
      setOfficerInternalNote('');
      fetchAnalytics();
    } catch (err) {
      console.error('Error performing officer action:', err);
    } finally {
      setOfficerActionLoading(false);
    }
  };

  const handleDetectDuplicates = async () => {
    if (!selectedComplaint) return;
    setDupCheckLoading(true);
    setDupCheckResult(null);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/detect-duplicates`, {
        method: 'POST'
      });
      const data = await res.json();
      setDupCheckResult(data);
      
      // Update logs in local states if duplicate warning was added
      if (data.isDuplicate) {
        fetchComplaints();
        if (selectedComplaint) {
          // fetch individual to sync logs
          const syncRes = await fetch('/api/complaints');
          const syncData = await syncRes.json();
          const target = syncData.find((c: Complaint) => c.id === selectedComplaint.id);
          if (target) setSelectedComplaint(target);
        }
      }
    } catch (err) {
      console.error('Error checking duplicates:', err);
    } finally {
      setDupCheckLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/reports/generate', { method: 'POST' });
      const data = await res.json();
      setActiveReport(data);
    } catch (err) {
      console.error('Error generating planning report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  // Preset quick fill triggers
  const handleSelectPreset = (preset: typeof PRESET_DEMO_IMAGES[0]) => {
    setNewTitle(preset.title);
    setNewCategory(preset.category);
    setImagePreviewUrl(preset.url);
    // Use URL or mock simulated image data
    setNewImageBase64(preset.url);
    setNewDescription(`Grievance description for ${preset.name.toLowerCase()} incident. There is immediate interference with public flow in the neighborhood and requires localized corrective steps.`);
    
    // Simulate coordinates based on preset types to place them throughout the district
    if (preset.category === 'Water Supply') {
      setNewLat('37.7858');
      setNewLng('-122.4064');
      setNewWard('Ward 7 - Riverside');
    } else if (preset.category === 'Sanitation & Waste') {
      setNewLat('37.7719');
      setNewLng('-122.4224');
      setNewWard('Ward 8 - High Street');
    } else if (preset.category === 'Roads & Traffic') {
      setNewLat('37.7618');
      setNewLng('-122.3988');
      setNewWard('Ward 7 - Riverside');
    } else if (preset.category === 'Streetlights & Electricity') {
      setNewLat('37.7428');
      setNewLng('-122.4388');
      setNewWard('Ward 12 - Old Town');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewImageBase64(base64String);
      setImagePreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newContactName.trim() || !newContactEmail.trim()) {
      alert('Please fill out all required citizen metadata fields.');
      return;
    }

    setSubmittingComplaint(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          ward: newWard,
          latitude: parseFloat(newLat),
          longitude: parseFloat(newLng),
          contactName: newContactName,
          contactEmail: newContactEmail,
          imageData: newImageBase64 || null
        })
      });
      
      if (res.ok) {
        const newlyCreated = await res.json();
        // Reset form
        setNewTitle('');
        setNewDescription('');
        setNewImageBase64('');
        setImagePreviewUrl('');
        setShowFormSuccessAlert(true);
        
        // Refresh complaints list and analytics
        fetchComplaints();
        fetchAnalytics();
        
        // Auto navigate to active grievances tab to see the post
        setTimeout(() => {
          setShowFormSuccessAlert(false);
          setActiveTab('citizen-view');
          // Auto select the new complaint to show off the cool AI generation!
          setSelectedComplaint(newlyCreated);
        }, 2200);
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSimulateLocation = () => {
    // Generate coordinate within general municipality zone
    const centerLat = 37.7749;
    const centerLng = -122.4194;
    const deltaLat = (Math.random() - 0.5) * 0.08;
    const deltaLng = (Math.random() - 0.5) * 0.08;
    
    setNewLat((centerLat + deltaLat).toFixed(4));
    setNewLng((centerLng + deltaLng).toFixed(4));
    
    // Auto cycle wards based on coordinate quadrants
    const wards = [
      'Ward 7 - Riverside',
      'Ward 8 - High Street',
      'Ward 12 - Old Town',
      'Ward 3 - Metro Center',
      'Ward 5 - Industrial Park'
    ];
    const pickedWard = wards[Math.floor(Math.random() * wards.length)];
    setNewWard(pickedWard);
  };

  // Helper colors
  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Under Review': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Progress': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-xs">
              <Building className="w-6 h-6" id="brand-icon-building" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-950">AI Smart Constituency Connect</h1>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Vertex AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Empowering Citizens. Enabling Smarter Governance with AI.</p>
            </div>
          </div>

          {/* Quick Role Simulator Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> View Role:
            </span>
            <button 
              id="role-btn-citizen"
              onClick={() => {
                setUserRole('Citizen');
                setCommentAuthor('');
                if (activeTab === 'officer-dashboard') setActiveTab('citizen-view');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userRole === 'Citizen' 
                  ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Citizen
            </button>
            <button 
              id="role-btn-officer"
              onClick={() => {
                setUserRole('Municipal Officer');
                setCommentAuthor('Officer Patterson');
                setActiveTab('officer-dashboard');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userRole === 'Municipal Officer' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Municipal Officer
            </button>
            <button 
              id="role-btn-director"
              onClick={() => {
                setUserRole('Planning Director');
                setCommentAuthor('Director Henderson');
                setActiveTab('analytics-planning');
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                userRole === 'Planning Director' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Planning Director
            </button>
          </div>
        </div>
      </header>

      {/* PORTAL TAB NAVIGATION */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            
            {/* Citizen view tabs */}
            <button
              id="tab-btn-grievances"
              onClick={() => setActiveTab('citizen-view')}
              className={`border-b-2 py-4 px-1 text-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'citizen-view'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <AlertTriangle className="w-4.5 h-4.5" />
              Grievance Feed
            </button>
            
            <button
              id="tab-btn-file"
              onClick={() => setActiveTab('citizen-file')}
              className={`border-b-2 py-4 px-1 text-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'citizen-file'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5" />
              File New Grievance
            </button>

            {/* Officer Exclusive Tab */}
            {(userRole === 'Municipal Officer' || userRole === 'Planning Director') && (
              <button
                id="tab-btn-officer"
                onClick={() => setActiveTab('officer-dashboard')}
                className={`border-b-2 py-4 px-1 text-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'officer-dashboard'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Shield className="w-4.5 h-4.5 text-indigo-600" />
                Officer Dashboard
              </button>
            )}

            {/* Analytics Tab */}
            <button
              id="tab-btn-analytics"
              onClick={() => {
                setActiveTab('analytics-planning');
                if (!activeReport) {
                  // Pre-load default simulator if empty
                  handleGenerateReport();
                }
              }}
              className={`border-b-2 py-4 px-1 text-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'analytics-planning'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5 text-purple-600" />
              Analytics & Strategic Planning
            </button>

          </div>
        </div>
      </div>

      {/* CORE HERO INFORMATION BANNER */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white py-6 px-4 shadow-sm border-b border-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                Live Preview
              </span>
              <p className="text-indigo-200 text-xs font-semibold">MUNICIPAL CIVIC INTELLIGENCE PLATFORM</p>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {activeTab === 'citizen-view' && 'Active Grievance Feed & AI Insights'}
              {activeTab === 'citizen-file' && 'Submit an AI-Assisted Civic Grievance'}
              {activeTab === 'officer-dashboard' && 'Municipal Operations Console'}
              {activeTab === 'analytics-planning' && 'Constituency Spatial Intelligence Hub'}
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              {activeTab === 'citizen-view' && 'Track public issues reported in your district. Click on any ticket to view live status updates, AI-suggested citizen safety tips, and operational routing logs.'}
              {activeTab === 'citizen-file' && 'File your issue. Our Vertex AI Gemini pipeline will automatically categorize, prioritize, assign departments, and generate safety guidelines instantly.'}
              {activeTab === 'officer-dashboard' && 'Manage assigned tickets, coordinate dispatch departments, write internal engineering notes, and flag duplicate submissions automatically with AI.'}
              {activeTab === 'analytics-planning' && 'Explore real-time data trends across all wards and leverage generative Vertex AI intelligence models to automatically outline next-cycle planning budget recommendations.'}
            </p>
          </div>

          <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-700/50 text-xs text-indigo-200 flex flex-col gap-1 max-w-xs self-stretch md:self-auto justify-center">
            <div className="flex justify-between gap-4 font-semibold">
              <span>Your Active Role:</span>
              <span className="text-white font-bold">{userRole}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Mock User Email:</span>
              <span className="text-white text-opacity-80">joeclgtp@gmail.com</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>API Services:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* TAB 1: GRIEVANCE FEED */}
        {activeTab === 'citizen-view' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side filters + Feed List (cols: 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Filter Panel Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                <form onSubmit={handleSearchAndFilter} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4 text-indigo-600" /> Filter Grievances ({complaints.length})
                    </span>
                    <button 
                      type="button" 
                      onClick={resetFilters}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search issues (e.g. water, trash)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 font-medium"
                      />
                    </div>

                    {/* Category Selector */}
                    <div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 font-medium"
                      >
                        <option value="">All Categories</option>
                        <option value="Roads & Traffic">Roads & Traffic</option>
                        <option value="Sanitation & Waste">Sanitation & Waste</option>
                        <option value="Water Supply">Water Supply</option>
                        <option value="Streetlights & Electricity">Streetlights & Electricity</option>
                        <option value="Public Safety">Public Safety</option>
                        <option value="Public Health">Public Health</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Priority Selector */}
                    <div>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 font-medium"
                      >
                        <option value="">All Severity Priorities</option>
                        <option value="Critical">Critical Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>

                    {/* Status Selector */}
                    <div>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 font-medium"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4.5 h-4.5" /> Apply Filters & Search
                  </button>
                </form>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-base font-bold text-slate-800">Grievances Matching Filters</h3>
                  <button 
                    onClick={fetchComplaints}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Refresh Feed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                  </button>
                </div>

                {loading ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm font-semibold">Querying live municipal data registers...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Info className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">No matching grievances found</p>
                      <p className="text-slate-500 text-xs">Try resetting filters or widen your search criteria.</p>
                    </div>
                    <button
                      onClick={resetFilters}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  complaints.map((c) => (
                    <div 
                      key={c.id}
                      id={`complaint-card-${c.id}`}
                      onClick={() => setSelectedComplaint(c)}
                      className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer p-5 hover:shadow-md relative overflow-hidden ${
                        selectedComplaint?.id === c.id 
                          ? 'border-indigo-600 ring-1 ring-indigo-500' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Priority strip on the left edge */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        c.aiPriority === 'Critical' ? 'bg-rose-500' :
                        c.aiPriority === 'High' ? 'bg-amber-500' :
                        c.aiPriority === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 tracking-tight uppercase">Ticket: {c.id}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {c.ward}
                            </span>
                            {c.duplicateOfId && (
                              <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5" /> Duplicate Flagged
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 leading-tight pr-4">{c.title}</h4>
                        </div>

                        {/* Top Action Tags */}
                        <div className="flex items-center gap-1.5 self-start shrink-0">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${getPriorityColor(c.aiPriority)}`}>
                            {c.aiPriority}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${getStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>

                      {/* Complaint Snippet Description */}
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>

                      {/* Card Footer: Metadata and Action Button row */}
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3.5 gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-sm">
                            {c.category}
                          </span>
                          {c.comments.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-indigo-600">
                                <MessageSquare className="w-3.5 h-3.5" /> {c.comments.length}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Upvote button */}
                          <button
                            id={`upvote-btn-${c.id}`}
                            onClick={(e) => handleUpvote(c.id, e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              c.votedUserEmails.includes(newContactEmail || 'citizen.connect@civic.org')
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Validate ({c.upvotes})</span>
                          </button>

                          <button
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>Inspect</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right side Detail Drawer (cols: 5) */}
            <div className="lg:col-span-5">
              {selectedComplaint ? (
                <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md sticky top-24 overflow-hidden" id="detail-drawer">
                  
                  {/* Drawer Header */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                          AI INTEL INSIGHTS
                        </span>
                        <span className="text-slate-400 text-xs">Grievance: {selectedComplaint.id}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{selectedComplaint.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedComplaint(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-white hover:bg-slate-100 border border-slate-200 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-2xs"
                    >
                      ×
                    </button>
                  </div>

                  {/* Drawer Scrollable Body */}
                  <div className="p-5 max-h-[70vh] overflow-y-auto space-y-6">
                    
                    {/* Image Preview if uploaded */}
                    {selectedComplaint.imageData && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                        <img 
                          src={selectedComplaint.imageData} 
                          alt="Incident proof" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Suppress broken Unsplash presets if network drops
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Problem Statement Block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Problem Statement</span>
                        <span className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-sm normal-case">{selectedComplaint.category}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        "{selectedComplaint.description}"
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2.5 pt-1.5 text-xs">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">Reporter</span>
                          <span className="font-bold text-slate-800">{selectedComplaint.contactName}</span>
                        </div>
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600 overflow-hidden">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">Contact Email</span>
                          <span className="font-bold text-slate-800 truncate block" title={selectedComplaint.contactEmail}>
                            {selectedComplaint.contactEmail}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI SEVERITY EVALUATOR BLOCK */}
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950">
                          <Sparkles className="w-4 h-4 text-indigo-600" /> AI SEVERITY CLASSIFIER
                        </div>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${getPriorityColor(selectedComplaint.aiPriority)}`}>
                          {selectedComplaint.aiPriority} Severity
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="block font-bold text-indigo-900">Automated Reasoning:</span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {selectedComplaint.aiPriorityReasoning}
                        </p>
                      </div>

                      <div className="border-t border-indigo-100/70 pt-3 flex items-center justify-between text-xs">
                        <span className="text-indigo-900 font-bold">Assigned Dispatch Unit:</span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-indigo-600" /> {selectedComplaint.aiAssignedDepartment}
                        </span>
                      </div>
                    </div>

                    {/* AI SAFETY RECOMENDATIONS FOR PUBLIC */}
                    <div className="space-y-2.5">
                      <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        AI Recommended Public Safety Protocol
                      </span>
                      {selectedComplaint.aiSafetyRecommendations?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedComplaint.aiSafetyRecommendations.map((tip, i) => (
                            <li key={i} className="text-slate-600 text-xs flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Normal municipal hazard precautions apply.</p>
                      )}
                    </div>

                    {/* AI OPERATIONAL RESOLUTION DIRECTIVES */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-4">
                      <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        AI Suggested Engineering Checklist (Dispatch Team)
                      </span>
                      {selectedComplaint.aiOfficerRecommendations?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedComplaint.aiOfficerRecommendations.map((tip, i) => (
                            <li key={i} className="text-slate-600 text-xs flex items-start gap-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-indigo-600 font-extrabold shrink-0">[{i+1}]</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Awaiting technical inspector dispatch diagnostics.</p>
                      )}
                    </div>

                    {/* DUPLICATE EVALUATION TOOLBOX */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> AI DUPLICATE GRIEVANCE SCANNER
                        </span>
                        <button
                          onClick={handleDetectDuplicates}
                          disabled={dupCheckLoading}
                          className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-[11px] font-bold px-3 py-1 rounded-md transition-colors shadow-2xs"
                        >
                          {dupCheckLoading ? 'Analyzing...' : 'Scan Database'}
                        </button>
                      </div>

                      {dupCheckResult ? (
                        <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-2">
                          <div className="flex justify-between items-center font-bold text-amber-900 border-b border-amber-50 pb-1.5">
                            <span>Status: {dupCheckResult.isDuplicate ? '🚨 DUPLICATE FLAGGED' : '✓ UNIQUE GRIEVANCE'}</span>
                            <span>Confidence: {dupCheckResult.similarityPercentage}%</span>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed">
                            {dupCheckResult.reasoning}
                          </p>
                          {dupCheckResult.isDuplicate && dupCheckResult.duplicateOfId && (
                            <div className="mt-2 text-indigo-700 bg-indigo-50 p-2 rounded font-bold text-[11px]">
                              Duplicate of Active Issue ID: {dupCheckResult.duplicateOfId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-amber-800/80 text-xs font-medium">
                          Compare this incident dynamically with other active complaints in the local database to save public response budget resources.
                        </p>
                      )}
                    </div>

                    {/* PUBLIC CIVIC COMMENT CORNER */}
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Public Discussion ({selectedComplaint.comments.length})</span>
                        <span className="text-[10px] lowercase text-indigo-600">Secure Audit Sandbox</span>
                      </h4>

                      {/* Comment Feed */}
                      {selectedComplaint.comments.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {selectedComplaint.comments.map((comm) => (
                            <div 
                              key={comm.id} 
                              className={`p-3 rounded-xl border text-xs space-y-1 ${
                                comm.isInternal 
                                  ? 'bg-purple-50/50 border-purple-100 text-purple-950' 
                                  : 'bg-slate-50 border-slate-150 text-slate-800'
                              }`}
                            >
                              <div className="flex justify-between font-bold">
                                <span className="flex items-center gap-1 text-slate-900">
                                  {comm.authorName} 
                                  {comm.isInternal && (
                                    <span className="bg-purple-100 text-purple-800 text-[8px] px-1 py-0.2 rounded font-black">Staff</span>
                                  )}
                                </span>
                                <span className="text-slate-400 text-[10px] font-normal">
                                  {new Date(comm.timestamp).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="font-medium text-slate-700">{comm.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic">No comments posted yet. Start the community conversation.</p>
                      )}

                      {/* Comment Form */}
                      <form onSubmit={handlePostComment} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            required
                            placeholder="Your Name (e.g. resident)"
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
                          />
                          <div className="text-[10px] text-slate-400 flex items-center justify-end font-medium">
                            Role: {userRole}
                          </div>
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="Post a civic update or verification note..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full pl-3 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                          />
                          <button 
                            type="submit"
                            className="absolute right-1 top-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-md transition-colors"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* ACTIVITY AUDIT HISTORIC TRAIL */}
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        Grievance Audit Logs & Status Timeline
                      </span>
                      <div className="relative pl-4 border-l border-indigo-100 space-y-4">
                        {selectedComplaint.logs.map((log) => (
                          <div key={log.id} className="relative text-xs">
                            {/* Dot on the timeline */}
                            <div className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white" />
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 block leading-tight">{log.title}</span>
                              <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                                {log.description}
                              </p>
                              <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                                <span>Actor: {log.authorName}</span>
                                <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-3 sticky top-24">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-xs mx-auto">
                    <p className="font-bold text-slate-700 text-sm">Grievance Inspector</p>
                    <p className="text-slate-500 text-xs">Select any grievance ticket on the left to inspect its detailed Vertex AI analysis, active safety guidelines, and live municipal dispatch logs.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CITIZEN FILE COMPLAINT */}
        {activeTab === 'citizen-file' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">New Civic Grievance Form</h3>
                  <p className="text-xs text-slate-500">Provide incident descriptors to trigger automated AI routing protocols.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateLocation}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" /> Simulate Location Coordinates
                </button>
              </div>

              {showFormSuccessAlert && (
                <div className="m-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-1 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    Civic Record Registered Successfully!
                  </div>
                  <p className="text-xs text-emerald-700">
                    Vertex AI is analyzing the grievance context, determining routing departments, and building customized public safety guidelines. Redirecting to feed view...
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitComplaint} className="p-6 space-y-6">
                
                {/* PRESETS ACCELERATOR FOR DEMO */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    💡 Hackathon Demo Hot-fill Presets (Click to Auto-populate)
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PRESET_DEMO_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-50/20 hover:shadow-xs transition-all flex flex-col justify-between h-20 text-xs group"
                      >
                        <span className="font-extrabold text-slate-800 group-hover:text-indigo-950">{preset.name}</span>
                        <span className="text-[10px] text-indigo-600 font-bold tracking-tight">Load Preset →</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Inputs for Citizen contact details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="citizen-name">
                      Citizen Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="citizen-name"
                      type="text"
                      required
                      placeholder="Sarah Jenkins"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="citizen-email">
                      Contact Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="citizen-email"
                      type="email"
                      required
                      placeholder="sarah.j@example.com"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Grid Inputs for Title and Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="grievance-title">
                      Grievance Headline <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="grievance-title"
                      type="text"
                      required
                      placeholder="E.g. Burst water main flooding central corridor sidewalk"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="user-category">
                      Category Selected <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="user-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Category)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700 font-semibold"
                    >
                      <option value="Roads & Traffic">Roads & Traffic</option>
                      <option value="Sanitation & Waste">Sanitation & Waste</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Streetlights & Electricity">Streetlights & Electricity</option>
                      <option value="Public Safety">Public Safety</option>
                      <option value="Public Health">Public Health</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Description Body text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="grievance-desc">
                    Incident Description & Environmental Hazard Context <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    id="grievance-desc"
                    required
                    rows={4}
                    placeholder="Provide granular detail. E.g. approximate size, leak speed, dangerous factors, proximity to public schools/hospitals..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium placeholder-slate-400"
                  />
                </div>

                {/* Spatial Mapping Grid */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600" /> Administrative Ward & Spatial Coordinates
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Automatic GIS Placement</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase" htmlFor="grid-ward">Ward / Sector</label>
                      <select
                        id="grid-ward"
                        value={newWard}
                        onChange={(e) => setNewWard(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
                      >
                        <option value="Ward 7 - Riverside">Ward 7 - Riverside</option>
                        <option value="Ward 8 - High Street">Ward 8 - High Street</option>
                        <option value="Ward 12 - Old Town">Ward 12 - Old Town</option>
                        <option value="Ward 3 - Metro Center">Ward 3 - Metro Center</option>
                        <option value="Ward 5 - Industrial Park">Ward 5 - Industrial Park</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase" htmlFor="grid-lat">Latitude</label>
                      <input 
                        id="grid-lat"
                        type="text"
                        value={newLat}
                        onChange={(e) => setNewLat(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase" htmlFor="grid-lng">Longitude</label>
                      <input 
                        id="grid-lng"
                        type="text"
                        value={newLng}
                        onChange={(e) => setNewLng(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Image upload area */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    Incident Asset Evidence Proof (Optional image file)
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Drag area */}
                    <div className="md:col-span-8 border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center text-center">
                      <input 
                        id="incident-file-uploader"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <label 
                        htmlFor="incident-file-uploader"
                        className="cursor-pointer space-y-2"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200 shadow-2xs mx-auto">
                          <PlusCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-700">Choose file or drag here</p>
                          <p className="text-[10px] text-slate-400">PNG, JPG or JPEG format proof up to 10MB</p>
                        </div>
                      </label>
                    </div>

                    {/* Preview box */}
                    <div className="md:col-span-4 border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-center min-h-[110px] relative overflow-hidden">
                      {imagePreviewUrl ? (
                        <>
                          <img 
                            src={imagePreviewUrl} 
                            alt="Asset proof preview" 
                            className="max-h-24 w-full object-contain rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageBase64('');
                              setImagePreviewUrl('');
                            }}
                            className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center hover:bg-rose-700 shadow-2xs font-extrabold"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center italic">Image proof preview</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission button */}
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-extrabold py-3.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {submittingComplaint ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing & Cataloging Grievance with Vertex AI...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4.5 h-4.5" /> Submit to AI Smart Connect Hub
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        )}

        {/* TAB 3: MUNICIPAL OFFICER DASHBOARD */}
        {activeTab === 'officer-dashboard' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Official Municipal Grievance Dashboard</h3>
                  <p className="text-xs text-slate-500">Authorized personnel secure operations registry loop.</p>
                </div>
                <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Building className="w-4.5 h-4.5 text-indigo-600" /> Logged as Staff Operator: {commentAuthor || 'Officer Mitchell'}
                </div>
              </div>

              {/* Grid of basic parameters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Critical Severity Tickets</span>
                  <span className="text-xl font-black text-rose-700">
                    {complaints.filter(c => c.aiPriority === 'Critical').length} Outstanding
                  </span>
                </div>
                <div className="p-3 bg-yellow-50/40 rounded-xl border border-yellow-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Awaiting Initial Review</span>
                  <span className="text-xl font-black text-yellow-800">
                    {complaints.filter(c => c.status === 'Pending').length} Pending
                  </span>
                </div>
                <div className="p-3 bg-sky-50/40 rounded-xl border border-sky-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Active Field Dispatches</span>
                  <span className="text-xl font-black text-sky-800">
                    {complaints.filter(c => c.status === 'In Progress').length} In Progress
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Resolved Ward Tickets</span>
                  <span className="text-xl font-black text-emerald-800">
                    {complaints.filter(c => c.status === 'Resolved').length} Resolved
                  </span>
                </div>
              </div>
            </div>

            {/* Officer Workflow Panel: List left, Actions on selected right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Complaints Table Left (cols: 7) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-500 uppercase">Operational Work-list ({complaints.length} Records)</span>
                  <button 
                    onClick={fetchComplaints}
                    className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reload List
                  </button>
                </div>

                <div className="divide-y divide-slate-150 max-h-[70vh] overflow-y-auto">
                  {complaints.map((c) => (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedComplaint(c)}
                      className={`p-4 hover:bg-slate-50/60 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                        selectedComplaint?.id === c.id ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-600">ID: {c.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{c.category}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate" title={c.title}>{c.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span>Ward: {c.ward}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-bold">Validate votes ({c.upvotes})</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(c.aiPriority)}`}>
                          {c.aiPriority}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Right (cols: 5) */}
              <div className="lg:col-span-5">
                {selectedComplaint ? (
                  <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-sm overflow-hidden space-y-5 p-5">
                    
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-400">TICKET OPERATIONS PANEL</span>
                        <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">ID: {selectedComplaint.id}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">{selectedComplaint.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Assigned Unit: <span className="font-bold text-slate-700">{selectedComplaint.aiAssignedDepartment}</span></p>
                    </div>

                    {/* STATUS AND DISPATCH UPDATE FORM */}
                    <form onSubmit={handleOfficerActionSubmit} className="space-y-4">
                      
                      {/* Status Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="action-status">
                          Update Complaint Status
                        </label>
                        <select
                          id="action-status"
                          value={officerStatusUpdate}
                          onChange={(e) => setOfficerStatusUpdate(e.target.value as ComplaintStatus)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      {/* Department override */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="action-dept">
                          Re-assign Dispatch Department
                        </label>
                        <input 
                          id="action-dept"
                          type="text"
                          value={officerDeptUpdate}
                          onChange={(e) => setOfficerDeptUpdate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden"
                        />
                      </div>

                      {/* Internal note input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600 uppercase" htmlFor="action-note">
                          Publish Official Progress Update / Internal Engineering Note
                        </label>
                        <textarea
                          id="action-note"
                          rows={3}
                          placeholder="Provide details about active repairs, estimated completion times, or joint valve closures..."
                          value={officerInternalNote}
                          onChange={(e) => setOfficerInternalNote(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden"
                        />
                        <span className="text-[10px] text-slate-400 block font-medium">This note will appear instantly on the public grievance timeline trail.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={officerActionLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-extrabold py-3 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        {officerActionLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synchronizing Ledger...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" /> Save Ticket Changes & Log Update
                          </>
                        )}
                      </button>

                    </form>

                    {/* Quick Trigger Duplicate warning block for reference */}
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 space-y-2 text-xs">
                      <span className="font-extrabold text-yellow-900 block uppercase">Operations Supervisor Tip</span>
                      <p className="text-slate-600 leading-relaxed">
                        To optimize budget allocations, click the <span className="font-bold">Scan Database</span> button on the Grievance Feed inspector to compare this ticket against other issues. AI flags duplicates instantly.
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-2">
                    <p className="font-bold text-slate-600 text-xs">Awaiting Selection</p>
                    <p className="text-slate-400 text-[11px]">Select any ticket on the left work-list to load the administrative status form panel.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: ANALYTICS & STRATEGIC PLANNING */}
        {activeTab === 'analytics-planning' && (
          <div className="space-y-8">
            
            {/* STATS COUNT GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Total Complaints</span>
                <span className="text-2xl font-black text-slate-900">{analytics?.totalComplaints || complaints.length}</span>
                <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Active community grid
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Resolved Issues</span>
                <span className="text-2xl font-black text-emerald-600">{analytics?.resolvedComplaints || 1}</span>
                <p className="text-[10px] text-slate-400 font-semibold">100% Transparency verified</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">In Active Progress</span>
                <span className="text-2xl font-black text-sky-600">{analytics?.inProgressComplaints || 2}</span>
                <p className="text-[10px] text-slate-400 font-semibold">Under regional department SLAs</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Awaiting Dispatch</span>
                <span className="text-2xl font-black text-yellow-600">{analytics?.pendingComplaints || 1}</span>
                <p className="text-[10px] text-slate-400 font-semibold">Being categorized by AI</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Average Resolution</span>
                <span className="text-2xl font-black text-slate-900">2.4 Days</span>
                <p className="text-[10px] text-emerald-600 font-semibold">6.2 hours ahead of SLA target</p>
              </div>
            </div>

            {/* REAL-TIME CHARTS AND LISTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Category Breakdown list with styled bars */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                  Grievance Distribution by Category
                </h3>
                
                <div className="space-y-3.5">
                  {analytics?.byCategory?.map((item) => {
                    const pct = analytics.totalComplaints > 0 
                      ? Math.round((item.count / analytics.totalComplaints) * 100) 
                      : 0;
                    return (
                      <div key={item.category} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{item.category}</span>
                          <span>{item.count} issues ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ward performance / Leaderboard */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                  Active Grievances Leaderboard by Ward
                </h3>

                <div className="space-y-3.5">
                  {analytics?.byWard?.map((item) => {
                    const pctResolved = item.total > 0 
                      ? Math.round((item.resolved / item.total) * 100) 
                      : 0;
                    return (
                      <div key={item.ward} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{item.ward}</span>
                          <span className="text-slate-400">
                            Total: <strong className="text-slate-800">{item.total}</strong> | Resolved: <strong className="text-emerald-600">{item.resolved}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="grow bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-purple-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(item.total / complaints.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-sm shrink-0">
                            {pctResolved}% Clear
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* STRATEGIC PLANNING INTELLIGENCE REPORT FROM VERTEX AI */}
            <div className="bg-linear-to-r from-purple-950 to-indigo-950 text-white rounded-2xl border border-purple-900 p-6 md:p-8 space-y-6 shadow-md">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/60 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-500/30 text-purple-300 border border-purple-500/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-300" /> VERTEX AI PLANNING COMPILER
                    </span>
                    <span className="text-slate-400 text-xs">Model: Gemini 3.5 Flash</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">AI-Assisted Municipal Budget & Strategic Planning Intelligence</h3>
                  <p className="text-xs text-purple-200">Compile real-time grievance feedback, upvotes, and hotspot volumes directly into optimal next-cycle directives.</p>
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2"
                >
                  {reportLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing regional records...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4.5 h-4.5" /> Re-Compile Strategic Report
                    </>
                  )}
                </button>
              </div>

              {reportLoading ? (
                <div className="py-12 text-center space-y-4 max-w-sm mx-auto">
                  <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-purple-200">Running Vertex AI Diagnostic Pipeline</p>
                    <p className="text-xs text-purple-300/80">Aggregating public complaints, calculating spatial density of risk points, and determining departmental budget allocations...</p>
                  </div>
                </div>
              ) : activeReport ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                  
                  {/* Left Report Panel: Executive diagnostics (cols: 7) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Executive Diagnostic Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Executive Diagnostic Summary
                      </h4>
                      <p className="text-slate-200 text-sm leading-relaxed bg-purple-950/40 p-4 rounded-xl border border-purple-900/50">
                        {activeReport.executiveSummary}
                      </p>
                    </div>

                    {/* Projections Budget allocations progress bar layout */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Recommended Resource Allocation Projections
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeReport.budgetAllocations?.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-purple-950/30 p-4 rounded-xl border border-purple-900/40 text-xs flex flex-col justify-between gap-2.5"
                          >
                            <div className="flex justify-between items-start font-bold">
                              <span className="text-slate-100 font-extrabold pr-2">{item.department}</span>
                              <span className="text-purple-300 font-black shrink-0 text-right">{item.allocationPercentage}% Capital</span>
                            </div>
                            
                            <div className="w-full bg-purple-950/70 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-purple-500 h-full rounded-full"
                                style={{ width: `${item.allocationPercentage}%` }}
                              />
                            </div>

                            <p className="text-purple-200 text-[11px] leading-relaxed italic">
                              "{item.justification}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cohesive technical commentary */}
                    <div className="bg-purple-950/20 p-4 rounded-xl border border-purple-900/30 text-xs text-purple-200/90 space-y-1.5">
                      <span className="block font-bold text-slate-100 uppercase tracking-wide text-[10px]">Solutions Architect Engineering Commentary</span>
                      <p className="leading-relaxed">
                        {activeReport.rawAnalysisText}
                      </p>
                    </div>

                  </div>

                  {/* Right Report Panel: Hotspots + Directives (cols: 5) */}
                  <div className="lg:col-span-5 space-y-6 bg-purple-950/30 p-5 rounded-xl border border-purple-900/40">
                    
                    {/* Hotspot list table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest">
                        🚨 Location Hazard Hotspots
                      </h4>

                      <div className="overflow-x-auto rounded-lg border border-purple-900/50">
                        <table className="w-full text-xs text-left divide-y divide-purple-900/50">
                          <thead className="bg-purple-950/60 text-[10px] text-purple-300 uppercase font-black">
                            <tr>
                              <th className="px-3 py-2">Ward / Sector</th>
                              <th className="px-3 py-2 text-center">Active Issues</th>
                              <th className="px-3 py-2">Primary Threat Concern</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-900/30 text-slate-200">
                            {activeReport.criticalHotspots?.map((hs, idx) => (
                              <tr key={idx} className="hover:bg-purple-950/40">
                                <td className="px-3 py-2 font-bold">{hs.location}</td>
                                <td className="px-3 py-2 text-center font-black text-purple-300">{hs.issueCount}</td>
                                <td className="px-3 py-2 font-medium">{hs.primaryConcern}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Strategic Directives list */}
                    <div className="space-y-3.5 pt-2">
                      <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest">
                        🎯 Priority Strategic Directives
                      </h4>

                      <ul className="space-y-3">
                        {activeReport.strategicRecommendations?.map((rec, i) => (
                          <li key={i} className="text-slate-200 text-xs flex items-start gap-2.5 leading-relaxed bg-purple-950/50 p-3 rounded-lg border border-purple-900/40">
                            <span className="bg-purple-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0">{i+1}</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <p className="text-slate-400 text-xs">No strategic report generated yet.</p>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* FOOTER CO-ORDINATION */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" />
            <span>AI Smart Constituency Connect © 2026. Powered by Google Cloud Run & Vertex AI.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-slate-700">Terms of Transparency</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-700">Citizen Privacy Safeguards</a>
            <span>•</span>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold text-[10px]">Secure Sandbox Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
