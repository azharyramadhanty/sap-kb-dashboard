import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, FileTextIcon, FileIcon, PresentationIcon, DownloadIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDocument } from '../contexts/DocumentContext';

interface PreviewModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  document: any;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, setIsOpen, document }) => {
  const { currentUser } = useAuth();
  const { viewDocument, downloadDocument } = useDocument();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Check if user has access to the document
  const hasAccess = document.uploader.id === currentUser?.id || 
    document.access.some((user: any) => user.id === currentUser?.id);

  useEffect(() => {
    if (isOpen && hasAccess && document.id) {
      loadPreview();
    }
  }, [isOpen, document.id, hasAccess]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError('');
      const url = await viewDocument(document.id);
      setPreviewUrl(url);
    } catch (error: any) {
      console.error('Error loading preview:', error);
      setError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadDocument(document.id);
    } catch (error: any) {
      console.error('Error downloading document:', error);
    }
  };

  if (!hasAccess) {
    return null;
  }

  const getDocumentIcon = () => {
    const fileType = document.type.toLowerCase();
    if (fileType.includes('pdf')) {
        return <FileIcon className="h-16 w-16 text-red-500" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
        return <PresentationIcon className="h-16 w-16 text-orange-500" />;
    } else {
        return <FileTextIcon className="h-16 w-16 text-blue-500" />;
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
          {getDocumentIcon()}
          <h4 className="mt-4 text-lg font-medium text-gray-900">{document.name}</h4>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            onClick={handleDownload}
            className="btn-primary mt-6 inline-flex items-center"
          >
            <DownloadIcon className="mr-2 h-5 w-5" />
            Download Document
          </button>
        </div>
      );
    }

    if (document.type === 'pdf' && previewUrl) {
    }
    if (document.type.includes('pdf') && previewUrl) {
      return (
        <iframe
          src={previewUrl}
          className="h-full w-full rounded-lg border border-gray-200"
          title={document.name}
        />
      );
    }

    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
        {getDocumentIcon()}
        <h4 className="mt-4 text-lg font-medium text-gray-900">{document.name}</h4>
        <p className="mt-1 text-sm text-gray-500">
          Preview not available for this file type
        </p>
        <button
          onClick={handleDownload}
          className="btn-primary mt-6 inline-flex items-center"
        >
          <DownloadIcon className="mr-2 h-5 w-5" />
          Download Document
        </button>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {document.name}
                  </Dialog.Title>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownload}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      title="Download"
                    >
                      <DownloadIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center bg-gray-50 p-6">
                  {renderPreview()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PreviewModal;