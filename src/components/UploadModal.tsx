import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Upload, X } from 'lucide-react';
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
  
  const { uploadDocument, categories } = useDocument();
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

  const handleAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setAccessUsers(selectedValues);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Determine file type from extension
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Create a document object
      const newDoc = {
        name: file.name,
        type: extension,
        size: file.size,
        uploadDate: new Date().toISOString(),
        category: selectedCategory,
        uploader: currentUser,
        access: [
          currentUser, 
          ...allUsers.filter(user => accessUsers.includes(user.email))
        ],
      };
      
      // In a real app, you would upload the file to storage here
      // This is a simplified example
      await uploadDocument(newDoc, file);
      
      closeModal();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Upload Document
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={closeModal}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div
                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                      dragging 
                        ? 'border-[rgb(var(--pln-blue))] bg-[rgb(var(--pln-blue))]/10' 
                        : 'border-gray-300 hover:border-[rgb(var(--pln-blue))]'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="text-center">
                        <div className="mt-2 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-[rgb(var(--pln-blue))]" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          className="mt-2 text-xs text-[rgb(var(--pln-blue))] hover:underline"
                          onClick={() => setFile(null)}
                        >
                          Change file
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--pln-blue))]/10">
                          <Upload className="h-6 w-6 text-[rgb(var(--pln-blue))]" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-900">
                          Drag and drop your file here
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Supported formats: PDF, DOCX, PPTX
                        </p>
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="btn-primary cursor-pointer">
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
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-[rgb(var(--pln-blue))] focus:outline-none focus:ring-[rgb(var(--pln-blue))] sm:text-sm"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="access" className="block text-sm font-medium text-gray-700">
                          Share with (hold Ctrl/Cmd to select multiple)
                        </label>
                        <select
                          id="access"
                          name="access"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-[rgb(var(--pln-blue))] focus:outline-none focus:ring-[rgb(var(--pln-blue))] sm:text-sm"
                          multiple
                          value={accessUsers}
                          onChange={handleAccessChange}
                        >
                          {allUsers
                            .filter(user => user.email !== currentUser.email)
                            .map(user => (
                              <option key={user.email} value={user.email}>
                                {user.name} ({user.role})
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="btn-outline mr-3"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!file || loading}
                      onClick={handleUpload}
                    >
                      {loading ? 'Uploading...' : 'Upload'}
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