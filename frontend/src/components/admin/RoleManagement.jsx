import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const RoleManagement = () => {
  const { user: adminUser } = useAdminAuth();
  const [roles, setRoles] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRole, setSelectedRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch available roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/rbac/roles', {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/auth/students', {
        headers: {
          'X-Admin-Email': adminUser?.email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/rbac/users/${selectedStudent.user_id}/role`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Email': adminUser?.email,
          },
          body: JSON.stringify({
            user_id: selectedStudent.user_id,
            new_role: selectedRole,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(`Successfully updated ${selectedStudent.name}'s role to ${selectedRole}`);
        
        // Update local student list
        setStudents(students.map(s => 
          s.user_id === selectedStudent.user_id 
            ? { ...s, role: selectedRole }
            : s
        ));
        
        setSelectedStudent(null);
        setSelectedRole('student');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Role Management</h2>

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Roles */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Roles</h3>
          <div className="space-y-2">
            {roles.map(role => (
              <div key={role.role_name} className="p-3 border rounded">
                <h4 className="font-semibold">{role.role_name}</h4>
                <p className="text-sm text-gray-600">{role.description}</p>
                <div className="mt-2">
                  <p className="text-xs font-semibold">Permissions:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {role.permissions.map(perm => (
                      <span key={perm} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Assignment */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Assign Role to Student</h3>
          
          <div className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Student</label>
              <select
                value={selectedStudent?.user_id || ''}
                onChange={(e) => {
                  const student = students.find(s => s.user_id === e.target.value);
                  setSelectedStudent(student);
                  setSelectedRole(student?.role || 'student');
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select a student --</option>
                {students.map(student => (
                  <option key={student.user_id} value={student.user_id}>
                    {student.name} ({student.user_id}) - Current: {student.role || 'student'}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">New Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {roles.map(role => (
                  <option key={role.role_name} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="p-3 bg-blue-50 rounded">
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>User ID:</strong> {selectedStudent.user_id}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Current Role:</strong> {selectedStudent.role || 'student'}</p>
              </div>
            )}

            {/* Update Button */}
            <button
              onClick={handleUpdateRole}
              disabled={!selectedStudent || loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">All Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">User ID</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Role</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.user_id} className="hover:bg-gray-50">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.user_id}</td>
                  <td className="border p-2">{student.email}</td>
                  <td className="border p-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {student.role || 'student'}
                    </span>
                  </td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;

