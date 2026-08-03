import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';

const statusBadgeMap = {
  pending: 'pending',
  active: 'verified',
  paused: 'warning',
  rejected: 'rejected',
  expired: 'danger'
};

export default function AdminAdvertisements() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const { addToast } = useToast();

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const response = await adminAPI.getAdvertisements(params);
      if (response.data.success) {
        setAds(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      addToast('Failed to load advertisements', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleStatusChange = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [id]: status }));
    try {
      await adminAPI.updateAdStatus(id, status);
      addToast(`Advertisement ${status} successfully`, 'success');
      setDetailModal(null);
      fetchAds();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading((prev) => ({ ...prev, [rejectModal._id]: 'rejected' }));
    try {
      await adminAPI.updateAdStatus(rejectModal._id, 'rejected', rejectionReason);
      addToast('Advertisement rejected', 'success');
      setRejectModal(null);
      setRejectionReason('');
      setDetailModal(null);
      fetchAds();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to reject', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [rejectModal._id]: null }));
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Advertisement',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-textPrimary">{row.title}</p>
          {row.companyId?.companyName && (
            <p className="text-xs text-textSecondary">{row.companyId.companyName}</p>
          )}
        </div>
      )
    },
    {
      key: 'placement',
      label: 'Placement',
      render: (row) => <span className="text-sm text-textSecondary capitalize">{row.placement}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge status={statusBadgeMap[row.status] || 'pending'}>
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || 'Pending'}
        </Badge>
      )
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (row) => (
        <span className="text-sm text-textSecondary">${(row.budget || 0).toLocaleString()}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
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
          Manage
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Advertisements Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Advertising
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Advertisements</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Review and manage all advertisement submissions
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {['', 'pending', 'active', 'paused', 'rejected'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setStatusFilter(status); setPage(1); }}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={ads}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyMessage="No advertisements found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.title || 'Advertisement Details'}
        size="lg"
        footer={
          detailModal && detailModal.status === 'pending' ? (
            <>
              <Button variant="danger" onClick={() => setRejectModal(detailModal)}>
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => handleStatusChange(detailModal._id, 'active')}
                loading={actionLoading[detailModal._id] === 'active'}
              >
                Approve
              </Button>
            </>
          ) : null
        }
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-textPrimary">{detailModal.title}</h3>
                {detailModal.companyId?.companyName && (
                  <p className="text-sm text-textSecondary">by {detailModal.companyId.companyName}</p>
                )}
              </div>
              <Badge status={statusBadgeMap[detailModal.status]}>
                {detailModal.status?.charAt(0).toUpperCase() + detailModal.status?.slice(1)}
              </Badge>
            </div>

            {detailModal.description && (
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Description</p>
                <p className="text-sm text-textPrimary">{detailModal.description}</p>
              </div>
            )}

            {detailModal.targetUrl && (
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Target URL</p>
                <a href={detailModal.targetUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-accent-text hover:text-accent-text/80 transition-colors">
                  {detailModal.targetUrl}
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-textSecondary">Placement</p>
                <p className="text-sm text-textPrimary capitalize">{detailModal.placement}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Budget</p>
                <p className="text-sm text-textPrimary">${(detailModal.budget || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Created</p>
                <p className="text-sm text-textPrimary">{new Date(detailModal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {detailModal.rejectionReason && (
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
        title="Reject Advertisement"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading[rejectModal?._id] === 'rejected'}>
              Reject
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-textSecondary">
            Reject <span className="text-text-textPrimary font-medium">{rejectModal?.title}</span>?
          </p>
          <textarea
            placeholder="Enter rejection reason (optional)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}
