import React, { useState } from 'react';
import DocumentCard from '../components/DocumentCard';
import DocumentFilter from '../components/DocumentFilter';
import { useDocument } from '../contexts/DocumentContext';

const Archive: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'newest',
  });
  
  const { archivedDocuments } = useDocument();
  
  // Apply filters
  const filteredDocuments = archivedDocuments
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
        <p className="mt-1 text-sm text-gray-500">
          Documents that have been removed from the main library
        </p>
      </div>
      
      <DocumentFilter filters={filters} setFilters={setFilters} />
      
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
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No archived documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            The archive is currently empty
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} isArchived={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;