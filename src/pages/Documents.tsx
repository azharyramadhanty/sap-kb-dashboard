import React, { useState } from 'react';
import { PlusCircle, Filter, Search, Grid, List } from 'lucide-react';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import DocumentCard from '../components/DocumentCard';
import UploadModal from '../components/UploadModal';

const Documents: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'newest',
  });
  
  const { documents } = useDocument();
  const { hasPermission } = useAuth();
  
  const canUpload = hasPermission('write');
  
  // Apply filters
  const filteredDocuments = documents
    .filter(doc => {
      if (filters.search && !doc.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type && doc.type !== filters.type) {
        return false;
      }
      if (filters.category && doc.category !== filters.category) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="mt-1 text-slate-600">
            Manage all your documents in one place
          </p>
        </div>
        
        {canUpload && (
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Upload Document
            </button>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-white/20">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filters:</span>
          </div>
          
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white/50 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Categories</option>
              <option value="SAP CMCT">SAP CMCT</option>
              <option value="SAP FI">SAP FI</option>
              <option value="SAP QM">SAP QM</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white/50 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (DOCX)</option>
              <option value="pptx">PowerPoint (PPTX)</option>
            </select>
            
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white/50 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No documents found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {canUpload 
              ? "Get started by uploading a new document" 
              : "No documents match your search criteria"
            }
          </p>
          {canUpload && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Upload Document
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
        }>
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} viewMode={viewMode} />
          ))}
        </div>
      )}
      
      <UploadModal
        isOpen={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
      />
    </div>
  );
};

export default Documents;