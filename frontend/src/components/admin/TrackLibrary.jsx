import React, { useState, useEffect } from 'react';
import { Library, Search, Plus, Edit2, Trash2, Eye, Filter, CheckCircle, Clock, Headphones, BookOpen, PenTool } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { useNavigate } from 'react-router-dom';

export function TrackLibrary() {
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showToastMsg, setShowToastMsg] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setShowToastMsg({ message, type });
    setTimeout(() => setShowToastMsg(null), 3000);
  };

  // Load tracks on mount
  useEffect(() => {
    loadTracks();
  }, []);

  // Filter tracks when search or filters change
  useEffect(() => {
    let result = tracks;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(track =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(track => track.track_type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(track => track.status === filterStatus);
    }

    setFilteredTracks(result);
  }, [searchTerm, filterType, filterStatus, tracks]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const data = await BackendService.getAllTracks();
      setTracks(data);
      setFilteredTracks(data);
    } catch (error) {
      showToast('Failed to load tracks', 'error');
      console.error('Error loading tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId, trackTitle) => {
    if (!window.confirm(`Are you sure you want to archive "${trackTitle}"?`)) {
      return;
    }

    try {
      await BackendService.deleteTrack(trackId);
      showToast('Track archived successfully', 'success');
      loadTracks();
    } catch (error) {
      if (error.message.includes('mock test')) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to delete track', 'error');
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'listening':
        return <Headphones className="w-5 h-5 text-blue-600" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'writing':
        return <PenTool className="w-5 h-5 text-purple-600" />;
      default:
        return <Library className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'listening':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'reading':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'writing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Published</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>;
      case 'archived':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Archived</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Notification */}
      {showToastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          showToastMsg.type === 'success' ? 'bg-green-500' : 
          showToastMsg.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white font-medium`}>
          {showToastMsg.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Library className="w-8 h-8 text-blue-600" />
              Track Library
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your imported test tracks
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/ai-import')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Import New Track
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="listening">🎧 Listening</option>
            <option value="reading">📖 Reading</option>
            <option value="writing">✍️ Writing</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span>Total: <strong>{tracks.length}</strong></span>
          <span>|</span>
          <span>Listening: <strong>{tracks.filter(t => t.track_type === 'listening').length}</strong></span>
          <span>Reading: <strong>{tracks.filter(t => t.track_type === 'reading').length}</strong></span>
          <span>Writing: <strong>{tracks.filter(t => t.track_type === 'writing').length}</strong></span>
        </div>
      </div>

      {/* Track Grid */}
      {filteredTracks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No tracks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Start by importing your first track from PDF'}
          </p>
          <button
            onClick={() => navigate('/admin/ai-import')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Import First Track
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map(track => (
            <div key={track.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Card Header */}
              <div className={`p-4 border-b-4 ${getTypeColor(track.track_type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(track.track_type)}
                    <span className="text-xs font-semibold uppercase">
                      {track.track_type}
                    </span>
                  </div>
                  {getStatusBadge(track.status)}
                </div>
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                  {track.title}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {track.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>{track.metadata?.question_count || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{Math.round((track.metadata?.duration_seconds || 0) / 60)} min</span>
                  </div>
                </div>

                {/* Source Badge */}
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    track.source === 'ai_import'
                      ? 'bg-purple-100 text-purple-700'
                      : track.source === 'converted'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {track.source === 'ai_import' ? '🤖 AI Import' : 
                     track.source === 'converted' ? '🔄 Converted' : '✍️ Manual'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/tests/${track.exam_id}/questions`)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteTrack(track.id, track.title)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                Created: {new Date(track.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
