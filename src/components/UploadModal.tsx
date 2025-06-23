import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Upload, X, FileText, Database } from 'lucide-react';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, setIsOpen }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessUsers, setAccessUsers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('SAP CMCT');
  
  const { uploadDocument } = useDocument();
  const { currentUser, allUsers } = useAuth();

  const closeModal = () => {
    setIsOpen(false);
    setFile(null);
    setAccessUsers([]);
    setSelectedCategory('SAP CMCT');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    const validExtensions = ['pdf', 'docx', 'pptx'];
    
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (validTypes.includes(file.type) || validExtensions.includes(extension)) {
      setFile(file);
    } else {
      alert('Invalid file type. Please upload a PDF, DOCX, or PPTX file.');
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) return;
    
    setLoading(true);
    
    try {
      await uploadDocument(file, selectedCategory as any, accessUsers);
      closeModal();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-6 text-left align-middle shadow-2xl transition-all border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                      Upload Document
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                    onClick={closeModal}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6">
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
                      dragging 
                        ? 'border-blue-400 bg-blue-50/50' 
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          onClick={() => setFile(null)}
                        >
                          Change file
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-900">
                          Drag and drop your file here
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Supported formats: PDF, DOCX, PPTX (Max 50MB)
                        </p>
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                            <span>Select file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  {file && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="SAP CMCT">SAP CMCT</option>
                          <option value="SAP FI">SAP FI</option>
                          <option value="SAP QM">SAP QM</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="access" className="block text-sm font-medium text-slate-700 mb-2">
                          Share with users (optional)
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {allUsers
                            .filter(user => user.id !== currentUser?.id)
                            .map(user => (
                              <label key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                  checked={accessUsers.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setAccessUsers([...accessUsers, user.id]);
                                    } else {
                                      setAccessUsers(accessUsers.filter(id => id !== user.id));
                                    }
                                  }}
                                />
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                              </label>
                            ))
                          }
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-700">
                          Document will be stored in Azure Storage with automatic indexing
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      disabled={!file || loading}
                      onClick={handleUpload}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading to Azure...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload to Azure
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UploadModal;