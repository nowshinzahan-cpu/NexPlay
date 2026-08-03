import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const { addToast } = useToast();

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (statusFilter) params.status = statusFilter;

      const response = await adminAPI.getCompanies(params);
      if (response.data.success) {
        setCompanies(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      addToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleVerify = async (companyId, status) => {
    setActionLoading(true);
    try {
      await adminAPI.verifyCompany(companyId, status, '');
      addToast(`Company ${status} successfully`, 'success');
      setDetailModal(null);
      fetchCompanies();
    } catch (error) {
      addToast(error.response?.data?.message || `Failed to ${status} company`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await adminAPI.verifyCompany(rejectModal._id, 'rejected', rejectionReason);
      addToast('Company rejected', 'success');
      setRejectModal(null);
      setRejectionReason('');
      setDetailModal(null);
      fetchCompanies();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to reject company', 'error');
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
      fetchCompanies();
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
      fetchCompanies();
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
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent-text font-bold text-sm">
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
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge status={row.verificationStatus}>
          {row.verificationStatus.charAt(0).toUpperCase() + row.verificationStatus.slice(1)}
        </Badge>
      )
    },
    {
      key: 'website',
      label: 'Website',
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-text hover:text-accent-text/80 transition-colors"
          >
            {(() => { try { return new URL(row.website).hostname; } catch { return row.website; } })()}
          </a>
        ) : (
          <span className="text-sm text-textSecondary">—</span>
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
        <Button variant="secondary" size="sm" onClick={() => setDetailModal(row)}>
          View Details
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Companies Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Companies
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Companies</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Manage registered companies and their verification status
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button
          variant={!statusFilter ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => { setStatusFilter(''); setPage(1); }}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => { setStatusFilter('pending'); setPage(1); }}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'verified' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => { setStatusFilter('verified'); setPage(1); }}
        >
          Verified
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => { setStatusFilter('rejected'); setPage(1); }}
        >
          Rejected
        </Button>
      </div>

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
        searchPlaceholder="Search companies by name or email..."
        emptyMessage="No companies found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.companyName || 'Company Details'}
        size="lg"
        footer={
          detailModal?.verificationStatus === 'pending' ? (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  setRejectModal(detailModal);
                }}
                loading={actionLoading}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => handleVerify(detailModal._id, 'verified')}
                loading={actionLoading}
              >
                Approve
              </Button>
            </>
          ) : detailModal?.verificationStatus === 'rejected' ? (
            <>
              <Button
                variant="primary"
                onClick={() => handleVerify(detailModal._id, 'verified')}
                loading={actionLoading}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Accept
              </Button>
              <Button
                variant={detailModal?.isActive === false ? 'secondary' : 'warning'}
                onClick={() =>
                  setConfirmModal({
                    type: 'block',
                    title: detailModal?.isActive ? 'Block Company' : 'Unblock Company',
                    message: `Are you sure you want to ${detailModal?.isActive ? 'block' : 'unblock'} ${detailModal?.companyName}?`,
                    action: () => handleBlockToggle(detailModal._id, detailModal?.isActive)
                  })
                }
                loading={actionLoading}
              >
                {detailModal?.isActive === false ? 'Unblock' : 'Block'}
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  setConfirmModal({
                    type: 'delete',
                    title: 'Delete Company',
                    message: `Are you sure you want to permanently delete ${detailModal?.companyName}? This action cannot be undone.`,
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
            </>
          ) : null
        }
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent-text font-bold text-2xl">
                {detailModal.companyName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-textPrimary">{detailModal.companyName}</h3>
                  <Badge status={detailModal.verificationStatus}>
                    {detailModal.verificationStatus.charAt(0).toUpperCase() + detailModal.verificationStatus.slice(1)}
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
                <p className="text-sm text-accent-text">
                  {detailModal.website || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Founded Year</p>
                <p className="text-sm text-textPrimary">{detailModal.foundedYear || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Location</p>
                <p className="text-sm text-textPrimary">{detailModal.location || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Joined</p>
                <p className="text-sm text-textPrimary">
                  {new Date(detailModal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {detailModal.description && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-text-textSecondary mb-1">Description</p>
                <p className="text-sm text-textPrimary">{detailModal.description}</p>
              </div>
            )}

            {detailModal.verificationStatus === 'rejected' && detailModal.rejectionReason && (
              <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
                <p className="text-xs text-danger mb-1 font-medium">Rejection Reason</p>
                <p className="text-sm text-danger/90">{detailModal.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectionReason(''); }}
        title="Reject Company"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading}>
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-textSecondary">
            Reject <span className="text-text-textPrimary font-medium">{rejectModal?.companyName}</span>?
          </p>
          <textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
        </div>
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
