import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, User, Mail, Phone, Building2, BookOpen, Hash, Calendar, AlertCircle } from 'lucide-react';

export function StudentProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        setImageError(false); // Reset image error on fetch

        const token = localStorage.getItem('student_token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/auth/student/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        console.log('[StudentProfile] Profile API response:', data);
        console.log('[StudentProfile] Student data:', data.student);
        console.log('[StudentProfile] Photo path from API:', data.student?.photo_path);
        setProfileData(data.student);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-900">Error Loading Profile</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const profile = profileData || user;

  console.log('[StudentProfile] Profile data:', profile);
  console.log('[StudentProfile] Photo path:', profile?.photo_path);
  console.log('[StudentProfile] Image error state:', imageError);

  // Get full photo URL
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) {
      console.log('[StudentProfile] No photo path provided');
      return null;
    }
    // If it's already a full URL, return as-is
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      console.log('[StudentProfile] Photo path is already a full URL:', photoPath);
      return photoPath;
    }
    // If it's a relative path, prepend the backend URL
    if (photoPath.startsWith('/')) {
      const fullUrl = `http://localhost:8000${photoPath}`;
      console.log('[StudentProfile] Constructed full URL from relative path:', fullUrl);
      return fullUrl;
    }
    // Otherwise, treat it as a relative path
    const fullUrl = `http://localhost:8000/uploads/student_photos/${photoPath}`;
    console.log('[StudentProfile] Constructed full URL from filename:', fullUrl);
    return fullUrl;
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Student Profile</h2>

        {/* Profile Header with Photo */}
        <div className="flex items-start gap-8 mb-8 pb-8 border-b">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              {(() => {
                const photoUrl = getPhotoUrl(profile?.photo_path);
                console.log('[StudentProfile] Rendering image:', {
                  hasPhotoPath: !!profile?.photo_path,
                  photoUrl: photoUrl,
                  imageError: imageError,
                  shouldRenderImage: profile?.photo_path && !imageError
                });

                return profile?.photo_path && !imageError ? (
                  <img
                    key={photoUrl}
                    src={photoUrl}
                    alt={profile?.name || 'Profile'}
                    className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                    crossOrigin="anonymous"
                    onLoad={() => {
                      console.log('[StudentProfile] Image loaded successfully:', photoUrl);
                    }}
                    onError={(e) => {
                      console.error('[StudentProfile] Image load failed:', {
                        url: photoUrl,
                        error: e,
                        errorMessage: e.message,
                        errorType: e.type,
                        target: e.target
                      });
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-5xl">
                      {getInitials(profile?.name)}
                    </span>
                  </div>
                );
              })()}
              <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Active</p>
          </div>

          {/* Quick Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile?.name || 'N/A'}</h3>
            <p className="text-sm text-gray-600 mb-4">{profile?.email || 'N/A'}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">User ID:</span>
                <span className="font-medium text-gray-900">{profile?.user_id || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Registration:</span>
                <span className="font-medium text-gray-900">{profile?.registration_number || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {profile?.status || 'active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profile?.email || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profile?.mobile || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Academic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profile?.institute || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{profile?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-900">{profile?.roll_number || 'N/A'}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {profile?.status === 'active' ? '✓ Active' : profile?.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Account Created</p>
              <p className="font-medium text-gray-900">{formatDate(profile?.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Login</p>
              <p className="font-medium text-gray-900">{profile?.last_login ? formatDate(profile.last_login) : 'First login'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

