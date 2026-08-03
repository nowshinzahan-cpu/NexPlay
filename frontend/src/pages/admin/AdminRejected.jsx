import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';

export default function AdminRejected() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, status: 'rejected' };
      const response = await adminAPI.getCompanies(params);
      if (response.data.success) {
        setCompanies(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      addToast('Failed to load rejected companies', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchRejected();
  }, [fetchRejected]);

  const handleAccept = async (companyId) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyCompany(companyId, 'verified');
      addToast('Company accepted and verified successfully', 'success');
      setDetailModal(null);
      fetchRejected();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to accept company', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockToggle = async (companyId, currentStatus) => {
    setActionLoading(true);
    try {
      await adminAPI.toggleCompanyStatus(companyId, !currentStatus);
      addToast(`Company ${currentStatus ? 'blocked' : 'unblocked'} successfully`, 'success');
      setConfirmModal(null);
      setDetailModal(null);
      fetchRejected();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update company status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    setActionLoading(true);
    try {
      await adminAPI.deleteCompany(companyId);
      addToast('Company deleted successfully', 'success');
      setConfirmModal(null);
      setDetailModal(null);
      fetchRejected();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete company', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Company',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger font-bold text-sm">
            {row.companyName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-textPrimary">{row.companyName}</p>
            <p className="text-xs text-textSecondary">{row.industry}</p>
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
      key: 'reason',
      label: 'Rejection Reason',
      render: (row) => (
        <span className="text-sm text-danger/80 max-w-[200px] block truncate" title={row.rejectionReason}>
          {row.rejectionReason || '—'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge status={row.isActive === false ? 'danger' : 'rejected'}>
            {row.isActive === false ? 'Blocked' : 'Rejected'}
          </Badge>
        </div>
      )
    },
    {
      key: 'rejectedAt',
      label: 'Rejected On',
      render: (row) => (
        <span className="text-sm text-textSecondary">
          {row.rejectedAt ? new Date(row.rejectedAt).toLocaleDateString() : new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setDetailModal(row)}>
          Manage
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Rejected Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Rejected
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Rejected Companies</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Review and manage companies that were not approved
          </p>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={companies}
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
        searchPlaceholder="Search rejected companies..."
        emptyMessage="No rejected companies found"
      />

      {/* Detail/Manage Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.companyName || 'Company Details'}
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-danger/10 flex items-center justify-center text-danger font-bold text-2xl">
                {detailModal.companyName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-textPrimary">{detailModal.companyName}</h3>
                  <Badge status={detailModal.isActive === false ? 'danger' : 'rejected'}>
                    {detailModal.isActive === false ? 'Blocked' : 'Rejected'}
                  </Badge>
                </div>
                <p className="text-sm text-textSecondary">{detailModal.industry}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Email</p>
                <p className="text-sm text-textPrimary">{detailModal.email}</p>
              </div>
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Username</p>
                <p className="text-sm text-textPrimary">@{detailModal.username}</p>
              </div>
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Website</p>
                <p className="text-sm text-accent-text">{detailModal.website || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Location</p>
                <p className="text-sm text-textPrimary">{detailModal.location || '—'}</p>
              </div>
              {detailModal.rejectedAt && (
                <div>
                  <p className="text-xs text-text-textSecondary mb-1">Rejected On</p>
                  <p className="text-sm text-textPrimary">
                    {new Date(detailModal.rejectedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Joined</p>
                <p className="text-sm text-textPrimary">
                  {new Date(detailModal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {detailModal.rejectionReason && (
              <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
                <p className="text-xs text-danger mb-1 font-medium">Rejection Reason</p>
                <p className="text-sm text-danger/90">{detailModal.rejectionReason}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
              <Button
                variant="primary"
                onClick={() => handleAccept(detailModal._id)}
                loading={actionLoading}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Accept & Verify
              </Button>
              <Button
                variant={detailModal.isActive === false ? 'secondary' : 'warning'}
                onClick={() =>
                  setConfirmModal({
                    type: 'block',
                    title: detailModal.isActive ? 'Block Company' : 'Unblock Company',
                    message: `Are you sure you want to ${detailModal.isActive ? 'block' : 'unblock'} ${detailModal.companyName}?`,
                    action: () => handleBlockToggle(detailModal._id, detailModal.isActive)
                  })
                }
                loading={actionLoading}
              >
                {detailModal.isActive === false ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Unblock
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block
                  </>
                )}
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  setConfirmModal({
                    type: 'delete',
                    title: 'Delete Company',
                    message: `Are you sure you want to permanently delete ${detailModal.companyName}? This action cannot be undone.`,
                    action: () => handleDelete(detailModal._id)
                  })
                }
                loading={actionLoading}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.title || 'Confirm'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmModal(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmModal?.type === 'delete' ? 'danger' : 'primary'}
              onClick={() => {
                confirmModal?.action();
                setConfirmModal(null);
              }}
              loading={actionLoading}
            >
              {confirmModal?.type === 'delete' ? 'Delete' : confirmModal?.title?.includes('Unblock') ? 'Unblock' : confirmModal?.title?.includes('Block') ? 'Block' : 'Confirm'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-textSecondary">{confirmModal?.message}</p>
      </Modal>
    </div>
  );
}
