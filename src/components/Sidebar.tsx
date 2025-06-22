import React, { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X, LayoutDashboard, FileText, Archive, Users, Database, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Archive', href: '/archive', icon: Archive },
    { name: 'Users', href: '/users', icon: Users, requireAdmin: true },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50">
      <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PLN Knowledge
            </span>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-slate-400 font-medium">CosmosDB Style</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          if (item.requireAdmin && !hasPermission('admin')) {
            return null;
          }
          
          const active = isActive(item.href);
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-blue-500/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              {item.name}
              {active && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="flex flex-shrink-0 border-t border-slate-700/50 p-4">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <span className="text-xs font-bold text-white">PLN</span>
          </div>
          <div className="ml-3">
            <p className="text-xs text-slate-400">© 2025 PLN</p>
            <p className="text-xs text-slate-500">Document Management</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-600/75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white/10 backdrop-blur-sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0">{/* Force sidebar to shrink to fit close icon */}</div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;