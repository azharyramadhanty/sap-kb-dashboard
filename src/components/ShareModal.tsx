import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

interface ShareModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  document: any;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, setIsOpen, document }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { shareDocument } = useDocument();
  const { allUsers, currentUser } = useAuth();
  
  const handleShare = async () => {
    try {
      await shareDocument(document.id, selectedUsers);
      setIsOpen(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };
  
  const availableUsers = allUsers.filter(
    user => user.id !== currentUser?.id && 
    !document.documentAccess?.find((a: any) => a.user?.id === user.id)
  );
  
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
                    Share Document
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Share "{document.name}" with other users
                  </p>
                  
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">
                      Current Access
                    </label>
                    <div className="mt-2 space-y-2">
                      {document.documentAccess?.map((access: any) => (
                        <div
                          key={access.user?.id || access.userId}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-2"
                        >
                          <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                              {(access.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{access.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-gray-500">{access.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>
                  
                  {availableUsers.length > 0 && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-700">
                        Add Users
                      </label>
                      <div className="mt-2 space-y-2">
                        {availableUsers.map(user => (
                          <label
                            key={user.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-2"
                          >
                            <div className="flex items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              className="form-checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="btn-outline mr-3"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleShare}
                      disabled={selectedUsers.length === 0}
                    >
                      Share
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

export default ShareModal;