import React, { useState } from 'react';
import { FileIcon, FileTextIcon, PresentationIcon, MoreVerticalIcon, DownloadIcon, TrashIcon, ShareIcon, EyeIcon, ArchiveIcon, RotateCcwIcon } from 'lucide-react';
import { Document } from '../types';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

interface DocumentCardProps {
  document: Document;
  isArchived?: boolean;
  viewMode?: 'grid' | 'list';
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, isArchived = false, viewMode = 'grid' }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { archiveDocument, restoreDocument, deleteDocument, downloadDocument, viewDocument } = useDocument();
  const { hasPermission, currentUser } = useAuth();
  
  const canModify = hasPermission('write') && (document.uploaderId === currentUser?.id || hasPermission('admin'));
  
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleView = async () => {
    try {
      await viewDocument(document.id);
      setDropdownOpen(false);
    } catch (error) {
      // Error handled by context
    }
  };
  
  const getDocumentIcon = () => {
    switch (document.type) {
      case 'pdf':
        return <FileIcon className="h-8 w-8 text-red-500" />;
      case 'docx':
        return <FileTextIcon className="h-8 w-8 text-blue-500" />;
      case 'pptx':
        return <PresentationIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <FileTextIcon className="h-8 w-8 text-slate-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SAP CMCT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SAP FI':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SAP QM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative rounded-xl border border-white/20 bg-white/80 backdrop-blur-sm p-4 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {getDocumentIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 truncate">{document.name}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-slate-500">
                  by {document.uploaderName}
                </span>
                <span className="text-sm text-slate-500">
                  {formatFileSize(document.size)}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getCategoryColor(document.category)}`}>
                  {document.category}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative ml-4">
            <button
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              onClick={handleToggleDropdown}
            >
              <MoreVerticalIcon className="h-4 w-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-200">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={handleView}
                >
                  <EyeIcon className="mr-3 h-4 w-4" />
                  View
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    downloadDocument(document.id);
                    setDropdownOpen(false);
                  }}
                >
                  <DownloadIcon className="mr-3 h-4 w-4" />
                  Download
                </button>
                {canModify && (
                  <>
                    {isArchived ? (
                      <>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                          onClick={() => {
                            restoreDocument(document.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <RotateCcwIcon className="mr-3 h-4 w-4" />
                          Restore
                        </button>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            deleteDocument(document.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <TrashIcon className="mr-3 h-4 w-4" />
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          archiveDocument(document.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <ArchiveIcon className="mr-3 h-4 w-4" />
                        Move to Archive
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="group relative rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {getDocumentIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight">{document.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Uploaded by <span className="font-medium">{document.uploaderName}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {formatFileSize(document.size)} • {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="relative ml-2">
          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            onClick={handleToggleDropdown}
          >
            <MoreVerticalIcon className="h-4 w-4" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-200">
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={handleView}
              >
                <EyeIcon className="mr-3 h-4 w-4" />
                View
              </button>
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  downloadDocument(document.id);
                  setDropdownOpen(false);
                }}
              >
                <DownloadIcon className="mr-3 h-4 w-4" />
                Download
              </button>
              {canModify && (
                <>
                  {isArchived ? (
                    <>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                        onClick={() => {
                          restoreDocument(document.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <RotateCcwIcon className="mr-3 h-4 w-4" />
                        Restore
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          deleteDocument(document.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <TrashIcon className="mr-3 h-4 w-4" />
                        Delete Permanently
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        archiveDocument(document.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <ArchiveIcon className="mr-3 h-4 w-4" />
                      Move to Archive
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
              {document.type.toUpperCase()}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getCategoryColor(document.category)}`}>
              {document.category}
            </span>
          </div>
          
          <div className="flex -space-x-1">
            {document.accessUsers.slice(0, 3).map((userId, index) => (
              <div 
                key={index}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs border-2 border-white shadow-sm"
                title={`User ${userId}`}
              >
                {userId.charAt(0).toUpperCase()}
              </div>
            ))}
            {document.accessUsers.length > 3 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-600 text-xs border-2 border-white">
                +{document.accessUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;