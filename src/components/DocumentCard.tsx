import React, { useState } from 'react';
import { FileIcon, FileTextIcon, PresentationIcon, MoreVerticalIcon, DownloadIcon, TrashIcon, ShareIcon, EyeIcon } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import { Document } from '../types/database';
import ShareModal from './ShareModal';
import PreviewModal from './PreviewModal';

interface DocumentCardProps {
  document: Document;
  isArchived?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, isArchived = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { moveToArchive, restoreDocument, deleteDocument, downloadDocument } = useDocument();
  const { userRole } = useAuth();
  
  const canModify = userRole === 'admin' || userRole === 'editor';
  
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handlePreview = async () => {
    setIsPreviewModalOpen(true);
    setDropdownOpen(false);
  };
  
  const getDocumentIcon = () => {
    const fileType = document.type.toLowerCase();
    if (fileType.includes('pdf')) {
        return <FileIcon className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
        return <FileTextIcon className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
        return <PresentationIcon className="h-8 w-8 text-orange-500" />;
    } else {
        return <FileTextIcon className="h-8 w-8 text-slate-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SAP_CMCT':
        return 'badge-blue';
      case 'SAP_FI':
        return 'badge-green';
      case 'SAP_QM':
        return 'badge-purple';
      default:
        return 'badge-gray';
    }
  };

  const formatCategoryDisplay = (category: string) => {
    return category.replace('_', ' ');
  };

  const getFileExtension = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'DOCX';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'PPTX';
    return type.split('/').pop()?.toUpperCase() || 'FILE';
  };
  
  return (
    <>
      <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {getDocumentIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight">{document.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                Uploaded by <span className="font-medium">{document.uploader?.name || 'Unknown User'}</span> on {formatDate(document.updatedAt.toString())}
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
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-200">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={handlePreview}
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
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setIsShareModalOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <ShareIcon className="mr-3 h-4 w-4" />
                      Share
                    </button>
                    {isArchived ? (
                      <>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                          onClick={() => {
                            restoreDocument(document.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12h1m8-9v1m8 8h1M5.6 5.6l.7.7m12.1-.7l-.7.7M9 16H5a2 2 0 0 1 0-4h9a4 4 0 0 0 0-8h-1" />
                            <path d="M9 12v6" />
                            <path d="m13 16-4 4-4-4" />
                          </svg>
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
                          moveToArchive(document.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <TrashIcon className="mr-3 h-4 w-4" />
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
              <span className="badge badge-gray">
                {getFileExtension(document.type)}
              </span>
              <span className={`badge ${getCategoryColor(document.category)}`}>
                {formatCategoryDisplay(document.category)}
              </span>
            </div>
            
            <div className="flex -space-x-1">
              {/* Show document access count */}
              {document._count.documentAccess > 0 && (
                <div 
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs border-2 border-white"
                  title={`Shared with ${document._count.documentAccess} user${document._count.documentAccess > 1 ? 's' : ''}`}
                >
                  {document._count.documentAccess}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ShareModal
        isOpen={isShareModalOpen}
        setIsOpen={setIsShareModalOpen}
        document={document}
      />

      <PreviewModal
        isOpen={isPreviewModalOpen}
        setIsOpen={setIsPreviewModalOpen}
        document={document}
      />
    </>
  );
};

export default DocumentCard;