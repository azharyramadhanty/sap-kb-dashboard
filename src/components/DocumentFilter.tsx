import React from 'react';
import { Filter } from 'lucide-react';
import { useDocument } from '../contexts/DocumentContext';

interface DocumentFilterProps {
  setFilters: (filters: any) => void;
  filters: {
    sort: string;
    type: string;
    category: string;
    search: string;
  };
}

const DocumentFilter: React.FC<DocumentFilterProps> = ({ filters, setFilters }) => {
  const { categories } = useDocument();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, type: e.target.value });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, category: e.target.value });
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, sort: e.target.value });
  };
  
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
        <div className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="form-input"
              placeholder="Search documents..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="sr-only">
              Category
            </label>
            <select
              id="category"
              className="form-select"
              value={filters.category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="type" className="sr-only">
              File Type
            </label>
            <select
              id="type"
              className="form-select"
              value={filters.type}
              onChange={handleTypeChange}
            >
              <option value="">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (DOCX)</option>
              <option value="pptx">PowerPoint (PPTX)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="sr-only">
              Sort By
            </label>
            <select
              id="sort"
              className="form-select"
              value={filters.sort}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentFilter