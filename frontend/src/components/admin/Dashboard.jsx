import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { BackendService } from '../../services/BackendService';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    totalSubmissions: 0,
    activeTests: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const exams = await FirebaseService.getAllExams();
        const totalSubmissions = exams.reduce((sum, exam) => sum + (exam.submission_count || 0), 0);
        const activeTests = exams.filter(exam => exam.published).length;
        
        setStats({
          totalTests: exams.length,
          totalSubmissions,
          activeTests,
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    loadStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Tests',
      value: stats.totalTests,
      change: '+3 this month',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      change: `${stats.totalSubmissions > 0 ? '+' : ''}${stats.totalSubmissions} total`,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    {
      title: 'Active Tests',
      value: stats.activeTests,
      change: 'Published tests',
      icon: <Users className="w-6 h-6 text-purple-500" />,
    },
    {
      title: 'Questions',
      value: stats.totalTests * 40,
      change: 'Total questions',
      icon: <Clock className="w-6 h-6 text-orange-500" />,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome to the IELTS Listening admin panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/tests"
            className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            <span>Create New Test</span>
          </a>
          <a
            href="/admin/submissions"
            className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            <span>View Submissions</span>
          </a>
          <a
            href="/admin/analytics"
            className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            <span>View Analytics</span>
          </a>
        </div>
      </div>
    </div>
  );
}