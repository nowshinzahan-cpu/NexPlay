import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailModal, setDetailModal] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const { addToast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCampaigns({ page, limit: 10 });
      if (response.data.success) {
        setCampaigns(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleStatusChange = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [id]: status }));
    try {
      await adminAPI.updateCampaignStatus(id, status);
      addToast(`Campaign ${status} successfully`, 'success');
      setDetailModal(null);
      fetchCampaigns();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update campaign', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const statusBadgeMap = {
    draft: 'pending',
    active: 'verified',
    paused: 'warning',
    completed: 'verified',
    rejected: 'rejected'
  };

  const columns = [
    {
      key: 'name',
      label: 'Campaign',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-textPrimary">{row.name}</p>
          <p className="text-xs text-textSecondary">{row.companyId?.companyName || 'Unknown Company'}</p>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      render: (row) => (
        <span className="text-sm text-textSecondary">{row.companyId?.email || '—'}</span>
      )
    },
    {
      key: 'ads',
      label: 'Ads',
      render: (row) => (
        <span className="text-sm text-textSecondary">{row.advertisements?.length || 0}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge status={statusBadgeMap[row.status] || 'pending'}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (row) => (
        <span className="text-sm text-textSecondary">
          ${(row.budget || 0).toLocaleString()}
        </span>
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
      {/* Campaigns Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Campaigns
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Campaigns</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Manage and oversee all marketing campaigns
          </p>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyMessage="No campaigns found"
      />

      {/* Detail/Manage Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.name || 'Campaign Details'}
        size="lg"
        footer={
          detailModal && detailModal.status !== 'rejected' && detailModal.status !== 'completed' ? (
            <>
              {detailModal.status === 'active' && (
                <Button
                  variant="secondary"
                  onClick={() => handleStatusChange(detailModal._id, 'paused')}
                  loading={actionLoading[detailModal._id] === 'paused'}
                >
                  Pause
                </Button>
              )}
              {detailModal.status === 'paused' || detailModal.status === 'draft' ? (
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange(detailModal._id, 'active')}
                  loading={actionLoading[detailModal._id] === 'active'}
                >
                  Approve
                </Button>
              ) : null}
              <Button
                variant="danger"
                onClick={() => handleStatusChange(detailModal._id, 'rejected')}
                loading={actionLoading[detailModal._id] === 'rejected'}
              >
                Reject
              </Button>
            </>
          ) : null
        }
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-textPrimary">{detailModal.name}</h3>
                <p className="text-sm text-textSecondary">
                  by {detailModal.companyId?.companyName || 'Unknown Company'}
                </p>
              </div>
              <Badge status={statusBadgeMap[detailModal.status]}>
                {detailModal.status.charAt(0).toUpperCase() + detailModal.status.slice(1)}
              </Badge>
            </div>

            {detailModal.description && (
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Description</p>
                <p className="text-sm text-textPrimary">{detailModal.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-textSecondary">Budget</p>
                <p className="text-sm text-textPrimary">${(detailModal.budget || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Advertisements</p>
                <p className="text-sm text-textPrimary">{detailModal.advertisements?.length || 0}</p>
              </div>
              {detailModal.targetAudience && (
                <div className="col-span-2">
                  <p className="text-xs text-textSecondary">Target Audience</p>
                  <p className="text-sm text-textPrimary">{detailModal.targetAudience}</p>
                </div>
              )}
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
    </div>
  );
}
