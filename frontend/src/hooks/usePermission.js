import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';

/**
 * Hook to check user permissions
 * Works for both admin and student users
 */
export const usePermission = () => {
  const studentAuth = useAuth();
  const adminAuth = useAdminAuth();
  
  // Determine which auth context to use
  const user = adminAuth.isAuthenticated ? adminAuth.user : studentAuth.user;
  const isAdmin = adminAuth.isAuthenticated;
  
  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission name to check
   * @returns {boolean} - True if user has permission
   */
  const hasPermission = (permission) => {
    if (!user) return false;
    
    const permissions = user.permissions || [];
    return permissions.includes(permission);
  };
  
  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissions - Array of permission names
   * @returns {boolean} - True if user has any permission
   */
  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    
    const userPermissions = user.permissions || [];
    return permissions.some(perm => userPermissions.includes(perm));
  };
  
  /**
   * Check if user has all specified permissions
   * @param {string[]} permissions - Array of permission names
   * @returns {boolean} - True if user has all permissions
   */
  const hasAllPermissions = (permissions) => {
    if (!user) return false;
    
    const userPermissions = user.permissions || [];
    return permissions.every(perm => userPermissions.includes(perm));
  };
  
  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdminUser = () => {
    return isAdmin || user?.role === 'admin';
  };
  
  /**
   * Check if user is teacher
   * @returns {boolean}
   */
  const isTeacher = () => {
    return user?.role === 'teacher';
  };
  
  /**
   * Check if user is student
   * @returns {boolean}
   */
  const isStudent = () => {
    return user?.role === 'student';
  };
  
  /**
   * Check if user can grade submissions
   * @returns {boolean}
   */
  const canGradeSubmissions = () => {
    return hasPermission('grade_submissions');
  };
  
  /**
   * Check if user can publish results
   * @returns {boolean}
   */
  const canPublishResults = () => {
    return hasPermission('publish_results');
  };
  
  /**
   * Check if user can manage users
   * @returns {boolean}
   */
  const canManageUsers = () => {
    return hasPermission('manage_users');
  };
  
  /**
   * Check if user can view analytics
   * @returns {boolean}
   */
  const canViewAnalytics = () => {
    return hasPermission('view_analytics');
  };
  
  /**
   * Check if user can create questions
   * @returns {boolean}
   */
  const canCreateQuestions = () => {
    return hasPermission('create_questions');
  };
  
  /**
   * Check if user can take exams
   * @returns {boolean}
   */
  const canTakeExams = () => {
    return hasPermission('take_exams');
  };
  
  /**
   * Get user's role
   * @returns {string|null}
   */
  const getUserRole = () => {
    return user?.role || null;
  };
  
  /**
   * Get user's permissions
   * @returns {string[]}
   */
  const getUserPermissions = () => {
    return user?.permissions || [];
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdminUser,
    isTeacher,
    isStudent,
    canGradeSubmissions,
    canPublishResults,
    canManageUsers,
    canViewAnalytics,
    canCreateQuestions,
    canTakeExams,
    getUserRole,
    getUserPermissions,
    user
  };
};

export default usePermission;

