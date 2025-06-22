import React from 'react';
import { Users as UsersIcon, Shield, Edit, Eye, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Users: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'editor':
        return <Edit className="h-5 w-5 text-blue-600" />;
      default:
        return <Eye className="h-5 w-5 text-green-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      editor: 'bg-blue-100 text-blue-800 border-blue-200',
      viewer: 'bg-green-100 text-green-800 border-green-200',
    };
    
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access and user management';
      case 'editor':
        return 'Can upload, edit, and share documents';
      case 'viewer':
        return 'Can view and download shared documents';
      default:
        return 'Limited access';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-800 bg-clip-text text-transparent">
          Users
        </h1>
        <p className="mt-1 text-slate-600">
          Manage users and their access rights in the system
        </p>
      </div>

      <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">System Users</h2>
              <p className="text-sm text-slate-500">{allUsers.length} total users</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">
              Role-based access control
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((user) => (
            <div 
              key={user.id} 
              className={`relative rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
                user.id === currentUser?.id 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-md' 
                  : 'bg-white/50 border-white/20 hover:bg-white/80'
              }`}
            >
              {user.id === currentUser?.id && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    You
                  </span>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                  <span className="text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">{user.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    {getRoleIcon(user.role)}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRoleBadge(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-2">
                    {getRoleDescription(user.role)}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                    
                    <span className="text-xs text-slate-400">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-900 mb-2">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Admin:</span>
              <span className="text-slate-600">Full access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Editor:</span>
              <span className="text-slate-600">Upload & share</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Viewer:</span>
              <span className="text-slate-600">View only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;