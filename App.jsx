import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, X, Upload, Download, FileText, ExternalLink } from 'lucide-react';

export default function UKLCLessonManager() {
  const [lessons, setLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    week: '',
    programme: '',
    level: '',
    focus: '',
    tags: []
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  
  // Admin password - CHANGE THIS to your own secure password
  const ADMIN_PASSWORD = 'uklc2024admin';

  // UKLC Structure
  const weeks = ['Week A', 'Week B', 'Week C', 'Week D'];
  const programmes = ['Connection', 'Action', 'Purpose'];
  const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
  const focuses = ['Language Focus', 'Leadership Focus', 'Culture Focus'];
  const commonTags = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Outdoor Lesson', 'Art Lesson', 'Science Lesson', 'Technology Lesson', 'Grammar', 'Speaking', 'Writing', 'Reading', 'Listening'];

  // Validate SharePoint URL
  const isValidSharePointUrl = (url) => {
    if (!url) return true; // Empty is okay
    return url.includes('sharepoint.com') || url.includes('sharepoint://');
  };

  // Open PDF in new tab
  const openPDF = (url) => {
    if (url) {
      if (url.startsWith('data:application/pdf')) {
        // It's a base64 encoded PDF
        const newWindow = window.open();
        newWindow.document.write(`
          <html>
            <head><title>UKLC Lesson PDF</title></head>
            <body style="margin:0">
              <embed width="100%" height="100%" src="${url}" type="application/pdf">
            </body>
          </html>
        `);
      } else {
        // It's a SharePoint link
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Admin login
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword('');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  // Load lessons from storage on mount
  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const result = await window.storage.get('uklc-lessons');
      if (result && result.value) {
        setLessons(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing lessons found, starting fresh');
    } finally {
      setLoading(false);
    }
  };

  const saveLessons = async (updatedLessons) => {
    try {
      await window.storage.set('uklc-lessons', JSON.stringify(updatedLessons));
      setLessons(updatedLessons);
    } catch (error) {
      console.error('Failed to save lessons:', error);
      alert('Failed to save lessons. Please try again.');
    }
  };

  const addLesson = (lesson) => {
    const newLesson = {
      ...lesson,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveLessons([...lessons, newLesson]);
  };

  const updateLesson = (updatedLesson) => {
    saveLessons(lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  };

  const deleteLesson = (id) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      saveLessons(lessons.filter(l => l.id !== id));
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(lessons, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'uklc-lessons-backup.json';
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedLessons = JSON.parse(e.target.result);
          saveLessons(importedLessons);
          alert('Lessons imported successfully!');
        } catch (error) {
          alert('Failed to import lessons. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = searchTerm === '' || 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWeek = filters.week === '' || lesson.week === filters.week;
    const matchesProgramme = filters.programme === '' || lesson.programme === filters.programme;
    const matchesLevel = filters.level === '' || lesson.level === filters.level;
    const matchesFocus = filters.focus === '' || lesson.focus === filters.focus;
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.every(tag => lesson.tags?.includes(tag));

    return matchesSearch && matchesWeek && matchesProgramme && matchesLevel && matchesFocus && matchesTags;
  });

  const clearFilters = () => {
    setFilters({
      week: '',
      programme: '',
      level: '',
      focus: '',
      tags: []
    });
    setSearchTerm('');
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading lessons...</div>
    </div>;
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom right, #e6eef3, #fad7d8)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6" style={{ borderTop: '4px solid #ec273b' }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold" style={{ color: '#1c3048' }}>UKLC Lesson Finder</h1>
            <div className="flex gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                    style={{ backgroundColor: '#ec273b' }}
                  >
                    <Plus size={18} />
                    Add Lesson
                  </button>
                  <label className="cursor-pointer text-white px-4 py-2 rounded-lg transition flex items-center gap-2" style={{ backgroundColor: '#1c3048' }}>
                    <Upload size={18} />
                    Import
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                  </label>
                  <button
                    onClick={exportData}
                    className="text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                    style={{ backgroundColor: '#1c3048' }}
                  >
                    <Download size={18} />
                    Export
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg transition"
                    style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 rounded-lg transition text-sm"
                  style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3" size={20} style={{ color: '#1c3048', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Search lessons by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#e6eef3', focusBorderColor: '#ec273b' }}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <select
              value={filters.week}
              onChange={(e) => setFilters({...filters, week: e.target.value})}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#e6eef3' }}
            >
              <option value="">All Weeks</option>
              {weeks.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            <select
              value={filters.programme}
              onChange={(e) => setFilters({...filters, programme: e.target.value})}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#e6eef3' }}
            >
              <option value="">All Programmes</option>
              {programmes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#e6eef3' }}
            >
              <option value="">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <select
              value={filters.focus}
              onChange={(e) => setFilters({...filters, focus: e.target.value})}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#e6eef3' }}
            >
              <option value="">All Focus Areas</option>
              {focuses.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
              style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}
            >
              <X size={18} />
              Clear Filters
            </button>
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            {commonTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setFilters({
                    ...filters,
                    tags: filters.tags.includes(tag)
                      ? filters.tags.filter(t => t !== tag)
                      : [...filters.tags, tag]
                  });
                }}
                className="px-3 py-1 rounded-full text-sm transition"
                style={{
                  backgroundColor: filters.tags.includes(tag) ? '#ec273b' : '#e6eef3',
                  color: filters.tags.includes(tag) ? '#ffffff' : '#1c3048'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4" style={{ borderLeft: '4px solid #1c3048' }}>
            <div className="text-sm" style={{ color: '#1c3048', opacity: 0.7 }}>Total Lessons</div>
            <div className="text-3xl font-bold" style={{ color: '#1c3048' }}>{lessons.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4" style={{ borderLeft: '4px solid #ec273b' }}>
            <div className="text-sm" style={{ color: '#1c3048', opacity: 0.7 }}>Filtered Results</div>
            <div className="text-3xl font-bold" style={{ color: '#ec273b' }}>{filteredLessons.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4" style={{ borderLeft: '4px solid #1c3048' }}>
            <div className="text-sm" style={{ color: '#1c3048', opacity: 0.7 }}>Programmes</div>
            <div className="text-3xl font-bold" style={{ color: '#1c3048' }}>{new Set(lessons.map(l => l.programme)).size}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4" style={{ borderLeft: '4px solid #ec273b' }}>
            <div className="text-sm" style={{ color: '#1c3048', opacity: 0.7 }}>Weeks Covered</div>
            <div className="text-3xl font-bold" style={{ color: '#ec273b' }}>{new Set(lessons.map(l => l.week)).size}</div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => (
            <div key={lesson.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition" style={{ borderTop: '3px solid #ec273b' }}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold" style={{ color: '#1c3048' }}>{lesson.title}</h3>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setShowAddModal(true);
                      }}
                      style={{ color: '#1c3048' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteLesson(lesson.id)}
                      style={{ color: '#ec273b' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}>
                    {lesson.week}
                  </span>
                  <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#fad7d8', color: '#1c3048' }}>
                    {lesson.programme}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#f0f279', color: '#1c3048' }}>
                    {lesson.level}
                  </span>
                  <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}>
                    {lesson.focus}
                  </span>
                </div>
              </div>

              {lesson.description && (
                <p className="text-sm mb-3" style={{ color: '#1c3048', opacity: 0.8 }}>{lesson.description}</p>
              )}

              {lesson.pdfPath && (
                <div className="mb-3">
                  <button
                    onClick={() => openPDF(lesson.pdfPath)}
                    className="w-full px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                    style={{ backgroundColor: '#ec273b', color: '#ffffff' }}
                  >
                    <FileText size={18} />
                    View PDF in SharePoint
                    <ExternalLink size={16} />
                  </button>
                </div>
              )}

              {lesson.tags && lesson.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {lesson.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-lg mb-4" style={{ color: '#1c3048' }}>No lessons found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 rounded-lg transition"
              style={{ backgroundColor: '#ec273b', color: '#ffffff' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" style={{ borderTop: '4px solid #ec273b' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1c3048' }}>Admin Login</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#e6eef3' }}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleLogin}
                  className="flex-1 px-6 py-2 rounded-lg transition font-medium"
                  style={{ backgroundColor: '#ec273b', color: '#ffffff' }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setPassword('');
                  }}
                  className="flex-1 px-6 py-2 rounded-lg transition font-medium"
                  style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <LessonModal
          lesson={editingLesson}
          weeks={weeks}
          programmes={programmes}
          levels={levels}
          focuses={focuses}
          commonTags={commonTags}
          onSave={(lesson) => {
            if (editingLesson) {
              updateLesson(lesson);
            } else {
              addLesson(lesson);
            }
            setShowAddModal(false);
            setEditingLesson(null);
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
}

function LessonModal({ lesson, weeks, programmes, levels, focuses, commonTags, onSave, onClose }) {
  const [formData, setFormData] = useState(lesson || {
    title: '',
    week: '',
    programme: '',
    level: '',
    focus: '',
    description: '',
    pdfPath: '',
    tags: []
  });
  const [urlError, setUrlError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('sharepoint'); // 'sharepoint' or 'upload'
  const [pdfFile, setPdfFile] = useState(null);

  const toggleTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter(t => t !== tag)
        : [...formData.tags, tag]
    });
  };

  const handlePdfPathChange = (value) => {
    setFormData({...formData, pdfPath: value});
    
    if (value && !value.includes('sharepoint.com') && !value.includes('sharepoint://')) {
      setUrlError('Please enter a valid SharePoint URL');
    } else {
      setUrlError('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({...formData, pdfPath: event.target.result});
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.week || !formData.programme || !formData.level || !formData.focus) {
      alert('Please fill in all required fields');
      return;
    }
    if (urlError) {
      alert('Please fix the SharePoint URL error before saving');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ borderTop: '4px solid #ec273b' }}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1c3048' }}>
            {lesson ? 'Edit Lesson' : 'Add New Lesson'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>
                Lesson Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#e6eef3' }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>Week *</label>
                <select
                  value={formData.week}
                  onChange={(e) => setFormData({...formData, week: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#e6eef3' }}
                  required
                >
                  <option value="">Select Week</option>
                  {weeks.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>Programme *</label>
                <select
                  value={formData.programme}
                  onChange={(e) => setFormData({...formData, programme: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#e6eef3' }}
                  required
                >
                  <option value="">Select Programme</option>
                  {programmes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#e6eef3' }}
                  required
                >
                  <option value="">Select Level</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>Focus *</label>
                <select
                  value={formData.focus}
                  onChange={(e) => setFormData({...formData, focus: e.target.value})}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#e6eef3' }}
                  required
                >
                  <option value="">Select Focus</option>
                  {focuses.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1c3048' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                style={{ borderColor: '#e6eef3' }}
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1c3048' }}>
                PDF Source
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={uploadMethod === 'sharepoint'}
                    onChange={() => setUploadMethod('sharepoint')}
                    style={{ accentColor: '#ec273b' }}
                  />
                  <span style={{ color: '#1c3048' }}>SharePoint Link</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={uploadMethod === 'upload'}
                    onChange={() => setUploadMethod('upload')}
                    style={{ accentColor: '#ec273b' }}
                  />
                  <span style={{ color: '#1c3048' }}>Upload PDF</span>
                </label>
              </div>

              {uploadMethod === 'sharepoint' ? (
                <>
                  <input
                    type="text"
                    value={formData.pdfPath}
                    onChange={(e) => handlePdfPathChange(e.target.value)}
                    placeholder="Paste SharePoint link here (e.g., https://yourcompany.sharepoint.com/...)"
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: urlError ? '#ec273b' : '#e6eef3' }}
                  />
                  {urlError && (
                    <p className="mt-1 text-sm" style={{ color: '#ec273b' }}>{urlError}</p>
                  )}
                  <p className="mt-1 text-xs" style={{ color: '#1c3048', opacity: 0.6 }}>
                    💡 Tip: In SharePoint, right-click the PDF → Share → Copy link, then paste here
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: '#e6eef3' }}
                  />
                  {pdfFile && (
                    <p className="mt-1 text-sm" style={{ color: '#1c3048' }}>
                      ✓ Selected: {pdfFile.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs" style={{ color: '#1c3048', opacity: 0.6 }}>
                    📎 Upload a PDF file from your computer
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1c3048' }}>Tags</label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1 rounded-full text-sm transition"
                    style={{
                      backgroundColor: formData.tags.includes(tag) ? '#ec273b' : '#e6eef3',
                      color: formData.tags.includes(tag) ? '#ffffff' : '#1c3048'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-2 rounded-lg transition font-medium"
                style={{ backgroundColor: '#ec273b', color: '#ffffff' }}
              >
                {lesson ? 'Update Lesson' : 'Add Lesson'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 rounded-lg transition font-medium"
                style={{ backgroundColor: '#e6eef3', color: '#1c3048' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}