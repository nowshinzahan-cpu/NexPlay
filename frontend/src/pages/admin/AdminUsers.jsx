import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({ page, limit: 10, search, status: '' });
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await adminAPI.deleteUser(deleteModal._id);
      addToast('User deleted successfully', 'success');
      setDeleteModal(null);
      fetchUsers();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminAPI.toggleUserStatus(user._id, !user.isActive);
      addToast(`User ${user.isActive ? 'blocked' : 'unblocked'} successfully`, 'success');
      fetchUsers();
    } catch (error) {
      addToast('Failed to update user status', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-accent-text text-xs font-bold">
              {row.fullName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-textPrimary">{row.fullName}</p>
            <p className="text-xs text-textSecondary">@{row.username}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="text-sm text-textSecondary">{row.email}</span>
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <Badge status={row.role === 'admin' ? 'admin' : 'user'}>
          {row.role}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge status={row.isActive ? 'verified' : 'danger'}>
          {row.isActive ? 'Active' : 'Blocked'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => (
        <span className="text-sm text-textSecondary">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant={row.isActive ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            {row.isActive ? 'Block' : 'Unblock'}
          </Button>
          {row.role !== 'admin' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModal(row)}
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Users Section */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)'
          }}
        />
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 sm:mb-5 border"
            style={{
              backgroundColor: 'rgba(var(--color-accent), 0.12)',
              borderColor: 'rgba(var(--color-accent), 0.20)',
              color: 'rgb(var(--color-accent-text))'
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Users
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Users</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Manage all registered users and their access levels
          </p>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchable
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        searchPlaceholder="Search users by name, email, or username..."
        emptyMessage="No users found"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
              Delete User
            </Button>
          </>
        }
      >
        <p className="text-textSecondary">
          Are you sure you want to delete <span className="text-text-textPrimary font-medium">{deleteModal?.fullName}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
