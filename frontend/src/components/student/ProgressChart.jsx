import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export function ProgressChart({ submissions }) {
  // Filter only published submissions
  const publishedSubmissions = submissions.filter(sub => sub.isPublished === true);
  
  // Prepare data for chart - only published completed tests
  const chartData = publishedSubmissions.map((submission, index) => {
    const percentage = (submission.totalQuestions || submission.total_questions)
      ? Math.round((submission.score / (submission.totalQuestions || submission.total_questions)) * 100)
      : 0;
    
    return {
      name: `Test ${index + 1}`,
      score: submission.score || 0,
      maxScore: submission.totalQuestions || submission.total_questions || 40,
      percentage: percentage,
      examTitle: submission.examTitle || submission.exam_title || 'Unknown Exam',
      date: submission.finishedAt || submission.submitted_at || submission.finished_at || 'N/A'
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{data.examTitle}</p>
          <p className="text-sm text-gray-600">Score: {data.score}/{data.maxScore}</p>
          <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(data.date).toLocaleDateString()}</p>
        </div>
      );
    }
    return null;
  };

  // Get color based on score percentage
  const getBarColor = (percentage) => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#3b82f6'; // blue
    if (percentage >= 40) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  if (!publishedSubmissions || publishedSubmissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Progress</h3>
        <div className="text-center py-12 text-gray-500">
          <p>No published results yet</p>
          <p className="text-sm mt-2">Results will appear here once your instructor publishes them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Performance Progress</h3>
        <p className="text-sm text-gray-600">Your scores across all completed tests</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 40]}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: '14px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            payload={[
              { value: 'Your Score', type: 'square', color: '#3b82f6' }
            ]}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="p-2 bg-green-50 rounded">
          <div className="text-xs text-gray-600">Excellent</div>
          <div className="text-sm font-semibold text-green-600">≥80%</div>
        </div>
        <div className="p-2 bg-blue-50 rounded">
          <div className="text-xs text-gray-600">Good</div>
          <div className="text-sm font-semibold text-blue-600">60-79%</div>
        </div>
        <div className="p-2 bg-orange-50 rounded">
          <div className="text-xs text-gray-600">Fair</div>
          <div className="text-sm font-semibold text-orange-600">40-59%</div>
        </div>
        <div className="p-2 bg-red-50 rounded">
          <div className="text-xs text-gray-600">Needs Work</div>
          <div className="text-sm font-semibold text-red-600">&lt;40%</div>
        </div>
      </div>
    </div>
  );
}
