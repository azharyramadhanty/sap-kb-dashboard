import React from 'react';
import { FileText, Archive, Users, Activity, TrendingUp, Clock, Database, Zap } from 'lucide-react';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { documents, archivedDocuments, recentActivities } = useDocument();
  const { allUsers } = useAuth();
  
  const categories = ['SAP CMCT', 'SAP FI', 'SAP QM'];
  const categoryStats = categories.map(category => ({
    name: category,
    count: documents.filter(doc => doc.category === category).length,
    color: category === 'SAP CMCT' ? 'from-blue-500 to-cyan-500' : 
           category === 'SAP FI' ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'
  }));

  const maxCount = Math.max(...categoryStats.map(stat => stat.count), 1);
  
  const StatCard = ({ title, value, icon: Icon, gradient, description }: any) => (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
          Knowledge Dashboard
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Welcome to the PLN SAP Knowledge Management System powered by CosmosDB-style architecture
        </p>
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Database className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-500 font-medium">Key-Value Document Store</span>
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-slate-500 font-medium">Real-time Access</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value={documents.length}
          icon={FileText}
          gradient="from-blue-500 to-cyan-500"
          description="Active documents"
        />
        <StatCard
          title="Archived Items"
          value={archivedDocuments.length}
          icon={Archive}
          gradient="from-slate-500 to-slate-600"
          description="In archive"
        />
        <StatCard
          title="System Users"
          value={allUsers.length}
          icon={Users}
          gradient="from-emerald-500 to-teal-500"
          description="Active users"
        />
        <StatCard
          title="Recent Activity"
          value={recentActivities.length}
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
          description="Last 24 hours"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-slate-500">{recentActivities.length} activities</span>
            </div>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    activity.type === 'upload' ? 'bg-green-100 text-green-600' :
                    activity.type === 'view' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'download' ? 'bg-purple-100 text-purple-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.type === 'upload' && <FileText className="h-4 w-4" />}
                    {activity.type === 'view' && <Activity className="h-4 w-4" />}
                    {activity.type === 'download' && <Archive className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {activity.userName} {activity.type}ed "{activity.documentName}"
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No recent activity</h3>
                <p className="mt-1 text-sm text-slate-500">Activity will appear here as users interact with documents.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Document Categories</h2>
            <span className="text-sm text-slate-500">{documents.length} total documents</span>
          </div>
          <div className="space-y-6">
            {categoryStats.map((stat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                    <span className="text-sm font-medium text-slate-900">{stat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{stat.count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                    style={{ width: `${(stat.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">CosmosDB Architecture</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Documents are stored as key-value pairs with automatic indexing for fast retrieval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;