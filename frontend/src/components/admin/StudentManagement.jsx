import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import FirebaseAuthService from '../../services/FirebaseAuthService';

export function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected, inactive
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const allStudents = await FirebaseAuthService.getAllStudents();
      setStudents(allStudents);
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.institution?.toLowerCase().includes(query) ||
        student.phoneNumber?.includes(query) ||
        student.rollNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleApprove = async (studentUid) => {
    if (!window.confirm('Are you sure you want to approve this student?')) return;
    
    setActionLoading(true);
    try {
      await FirebaseAuthService.approveStudent(studentUid);
      await loadStudents();
      alert('Student approved successfully!');
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Failed to approve student. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (studentUid) => {
    if (!window.confirm('Are you sure you want to reject this student?')) return;
    
    setActionLoading(true);
    try {
      await FirebaseAuthService.rejectStudent(studentUid);
      await loadStudents();
      alert('Student rejected.');
    } catch (error) {
      console.error('Error rejecting student:', error);
      alert('Failed to reject student. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (studentUid, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'inactive' : 'approved';
    const action = newStatus === 'approved' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this student?`)) return;
    
    setActionLoading(true);
    try {
      await FirebaseAuthService.toggleStudentStatus(studentUid, newStatus === 'approved');
      await loadStudents();
      alert(`Student ${action}d successfully!`);
    } catch (error) {
      console.error('Error toggling student status:', error);
      alert(`Failed to ${action} student. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (studentUid, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) return;
    
    setActionLoading(true);
    try {
      await FirebaseAuthService.deleteStudent(studentUid);
      await loadStudents();
      alert('Student deleted successfully.');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Rejected'
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: UserX,
        label: 'Inactive'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getStatusCount = (status) => {
    return students.filter(s => s.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage student registrations and approvals</p>
        </div>
        <button
          onClick={loadStudents}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{getStatusCount('pending')}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{getStatusCount('approved')}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{getStatusCount('rejected')}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, institution, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={student.photoURL || 'https://via.placeholder.com/40'}
                          alt={student.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.phoneNumber}</div>
                      {student.rollNumber && (
                        <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{student.institution}</div>
                      {student.department && (
                        <div className="text-sm text-gray-500">{student.department}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {student.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(student.uid)}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Approve"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(student.uid)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Reject"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {(student.status === 'approved' || student.status === 'inactive') && (
                          <button
                            onClick={() => handleToggleStatus(student.uid, student.status)}
                            disabled={actionLoading}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                            title={student.status === 'approved' ? 'Deactivate' : 'Activate'}
                          >
                            {student.status === 'approved' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(student.uid, student.name)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <img
                    src={selectedStudent.photoURL || 'https://via.placeholder.com/150'}
                    alt={selectedStudent.name}
                    className="w-32 h-32 rounded-full"
                  />
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Full Name:</span>
                      <span className="text-sm text-gray-900">{selectedStudent.name}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Email:</span>
                      <span className="text-sm text-gray-900">{selectedStudent.email}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Phone:</span>
                      <span className="text-sm text-gray-900">{selectedStudent.phoneNumber}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Status:</span>
                      {getStatusBadge(selectedStudent.status)}
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Institution:</span>
                      <span className="text-sm text-gray-900">{selectedStudent.institution}</span>
                    </div>
                    {selectedStudent.department && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-600 w-32">Department:</span>
                        <span className="text-sm text-gray-900">{selectedStudent.department}</span>
                      </div>
                    )}
                    {selectedStudent.rollNumber && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-600 w-32">Roll Number:</span>
                        <span className="text-sm text-gray-900">{selectedStudent.rollNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">System Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">User ID:</span>
                      <span className="text-sm text-gray-900 font-mono">{selectedStudent.uid}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Registered:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedStudent.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium text-gray-600 w-32">Last Updated:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedStudent.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {selectedStudent.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedStudent.uid);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Approve Student
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedStudent.uid);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        Reject Student
                      </button>
                    </>
                  )}
                  {(selectedStudent.status === 'approved' || selectedStudent.status === 'inactive') && (
                    <button
                      onClick={() => {
                        handleToggleStatus(selectedStudent.uid, selectedStudent.status);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      {selectedStudent.status === 'approved' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}