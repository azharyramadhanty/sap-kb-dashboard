import React, { useState } from 'react';
import { FileIcon, FileTextIcon, PresentationIcon, MoreVerticalIcon, DownloadIcon, TrashIcon, ShareIcon, EyeIcon } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import ShareModal from './ShareModal';
import PreviewModal from './PreviewModal';

interface DocumentCardProps {
  document: any;
  isArchived?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, isArchived = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { moveToArchive, restoreDocument, deleteDocument, downloadDocument } = useDocument();
  const { userRole } = useAuth();
  
  const canModify = userRole === 'admin' || userRole === 'editor';
  
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handlePreview = async () => {
    setPreviewUrl('#');
    setIsPreviewModalOpen(true);
    setDropdownOpen(false);
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
        return 'badge-blue';
      case 'SAP FI':
        return 'badge-green';
      case 'SAP QM':
        return 'badge-purple';
      default:
        return 'badge-gray';
    }
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
                Uploaded by <span className="font-medium">{document.uploader.name}</span> on {formatDate(document.updated_at)}
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
                {document.type.toUpperCase()}
              </span>
              <span className={`badge ${getCategoryColor(document.category)}`}>
                {document.category}
              </span>
            </div>
            
            <div className="flex -space-x-1">
              {document.access.slice(0, 3).map((user, index) => (
                <div 
                  key={index}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs border-2 border-white"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {document.access.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-600 text-xs border-2 border-white">
                  +{document.access.length - 3}
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
        previewUrl={previewUrl}
      />
    </>
  );
};

export default DocumentCard;