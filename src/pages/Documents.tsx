import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import DocumentFilter from '../components/DocumentFilter';
import UploadModal from '../components/UploadModal';
import Pagination from '../components/Pagination';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

const Documents: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'newest',
  });
  
  const { documents, documentsMeta, refreshDocuments } = useDocument();
  const { userRole } = useAuth();
  
  const canUpload = userRole === 'admin' || userRole === 'editor';
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refreshDocuments({
      page,
      limit: 10,
      ...filters,
    });
  };
  
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    refreshDocuments({
      page: 1,
      limit: 10,
      ...newFilters,
    });
  };
  
  // Apply filters
  const filteredDocuments = documents
    .filter(doc => {
      // Text search
      if (filters.search && !doc.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type && doc.type !== filters.type) {
        return false;
      }
      
      // Category filter
      if (filters.category && doc.category !== filters.category) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort
      switch (filters.sort) {
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'oldest':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your documents in one place
          </p>
        </div>
        
        {canUpload && (
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Upload Document
            </button>
          </div>
        )}
      </div>
      
      <DocumentFilter filters={filters} setFilters={handleFiltersChange} />
      
      {filteredDocuments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {canUpload 
              ? "Get started by uploading a new document" 
              : "No documents match your search criteria"
            }
          </p>
          {canUpload && (
            <div className="mt-6">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Upload Document
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
          
          {documentsMeta && (
            <Pagination
              currentPage={documentsMeta.page}
              totalPages={documentsMeta.totalPages}
              total={documentsMeta.total}
              limit={documentsMeta.limit}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
      
      <UploadModal
        isOpen={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
      />
    </div>
  );
};

export default Documents;