import React, { useState } from 'react';
import { FileText, Archive, Users, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { documents, archivedDocuments, recentActivities, categories } = useDocument();
  const { allUsers } = useAuth();
  
  // Last month's stats for comparison (in a real app, these would come from historical data)
  const previousStats = {
    documents: documents.length - 3,
    archived: archivedDocuments.length - 1,
    users: allUsers.length - 2,
  };

  // Calculate category distribution
  const categoryStats = categories.map(category => ({
    name: category,
    count: documents.filter(doc => doc.category === category).length,
    color: category === 'SAP CMCT' ? 'bg-blue-500' : 
           category === 'SAP FI' ? 'bg-emerald-500' : 'bg-purple-500'
  }));

  const maxCount = Math.max(...categoryStats.map(stat => stat.count), 1);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome to the PLN SAP Knowledge Management System
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value={documents.length}
          icon={FileText}
          color="bg-blue-600"
          previousValue={previousStats.documents}
        />
        <StatCard
          title="Archived Documents"
          value={archivedDocuments.length}
          icon={Archive}
          color="bg-slate-600"
          previousValue={previousStats.archived}
        />
        <StatCard
          title="Total Users"
          value={allUsers.length}
          icon={Users}
          color="bg-emerald-600"
          previousValue={previousStats.users}
        />
        <StatCard
          title="Recent Activities"
          value={recentActivities.length}
          icon={TrendingUp}
          color="bg-purple-600"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <span className="text-sm text-slate-500">{recentActivities.length} activities</span>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              <ActivityFeed activities={recentActivities.slice(0, 5)} />
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No recent activity</h3>
                <p className="mt-1 text-sm text-slate-500">Activity will appear here as users interact with documents.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Document Categories</h2>
            <span className="text-sm text-slate-500">{documents.length} total documents</span>
          </div>
          <div className="space-y-4">
            {categoryStats.map((stat, index) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <span className="text-sm font-medium text-slate-900">{stat.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stat.color}`}
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-600 w-8 text-right">{stat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;