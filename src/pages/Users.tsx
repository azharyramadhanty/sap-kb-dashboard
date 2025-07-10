import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';

const Users: React.FC = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { usersMeta, refreshUsers } = useAuth();
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };
  
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refreshUsers({
      page,
      limit: 10,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and their access rights
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="btn-primary"
            onClick={handleAddUser}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add User
          </button>
        </div>
      </div>
      
      <UserTable onEditUser={handleEditUser} />
      
      {usersMeta && (
        <Pagination
          currentPage={usersMeta.page}
          totalPages={usersMeta.totalPages}
          total={usersMeta.total}
          limit={usersMeta.limit}
          onPageChange={handlePageChange}
        />
      )}
      
      <UserModal
        isOpen={isUserModalOpen}
        setIsOpen={setIsUserModalOpen}
        userData={selectedUser}
      />
    </div>
  );
};

export default Users;