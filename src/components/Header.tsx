import React from 'react';
import { Menu, Search, Bell, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'editor':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-green-600" />;
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

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
      <button
        type="button"
        className="border-r border-slate-200 px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden hover:bg-slate-50 transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex flex-1 justify-between px-4 md:px-6">
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-lg">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative text-slate-400 focus-within:text-slate-600">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5" />
              </div>
              <input
                id="search"
                className="block w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-3 text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Search documents..."
                type="search"
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-4">
          <button
            type="button"
            className="rounded-xl p-2.5 text-slate-400 hover:bg-white/50 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
          </button>

          <div className="relative flex items-center">
            <div className="hidden items-center md:flex">
              <div className="mr-4 text-right">
                <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  {getRoleIcon(currentUser?.role || 'viewer')}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getRoleBadge(currentUser?.role || 'viewer')}`}>
                    {currentUser?.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <User className="h-5 w-5" />
            </div>
            <button
              onClick={logout}
              className="ml-3 flex items-center rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-white/50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;