import { useState, useEffect, useCallback } from 'react';
import { companyAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import DataTable from '../../components/DataTable';

export default function CompanyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAudience: '',
    budget: ''
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await companyAPI.getCampaigns({ page, limit: 10 });
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Campaign name is required', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const result = await companyAPI.createCampaign(formData);
      if (result.data.success) {
        addToast('Campaign created successfully', 'success');
        setCreateModal(false);
        setFormData({ name: '', description: '', targetAudience: '', budget: '' });
        fetchCampaigns();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create campaign', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await companyAPI.deleteCampaign(deleteModal._id);
      addToast('Campaign deleted', 'success');
      setDeleteModal(null);
      fetchCampaigns();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setActionLoading(false);
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
          {row.description && (
            <p className="text-xs text-text-textSecondary mt-0.5 truncate max-w-xs">{row.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'adCount',
      label: 'Advertisements',
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDetailModal(row)}>
            View
          </Button>
          {row.status === 'draft' && (
            <Button variant="danger" size="sm" onClick={() => setDeleteModal(row)}>
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)'
          }}
        />
        <div className="relative z-10">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                My <span className="text-gradient">Campaigns</span>
              </h2>
              <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                Plan and manage your marketing campaigns
              </p>
            </div>
            <Button variant="primary" onClick={() => setCreateModal(true)} className="shrink-0">
              Create Campaign
            </Button>
          </div>
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
        emptyMessage="No campaigns yet. Create your first one!"
      />

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => { setCreateModal(false); setFormData({ name: '', description: '', targetAudience: '', budget: '' }); }}
        title="Create Campaign"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={actionLoading}>Create</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Campaign Name *"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter campaign name"
          />
          <div>
            <label className="block text-sm font-medium text-text-textSecondary mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe your campaign"
            />
          </div>
          <Input
            label="Target Audience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => setFormData((p) => ({ ...p, targetAudience: e.target.value }))}
            placeholder="e.g., Young adults, Movie enthusiasts"
          />
          <Input
            label="Budget ($)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))}
            placeholder="0"
          />
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal?.name || 'Campaign Details'}
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-textPrimary">{detailModal.name}</h3>
                <Badge status={statusBadgeMap[detailModal.status]}>{detailModal.status}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-textSecondary">Budget</p>
                <p className="text-lg font-bold text-textPrimary">${(detailModal.budget || 0).toLocaleString()}</p>
              </div>
            </div>

            {detailModal.description && (
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Description</p>
                <p className="text-sm text-textPrimary">{detailModal.description}</p>
              </div>
            )}

            {detailModal.targetAudience && (
              <div>
                <p className="text-xs text-text-textSecondary mb-1">Target Audience</p>
                <p className="text-sm text-textPrimary">{detailModal.targetAudience}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-textSecondary">Status</p>
                <p className="text-sm text-textPrimary capitalize">{detailModal.status}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Advertisements</p>
                <p className="text-sm text-textPrimary">{detailModal.advertisements?.length || 0}</p>
              </div>
              {detailModal.startDate && (
                <div>
                  <p className="text-xs text-textSecondary">Start Date</p>
                  <p className="text-sm text-textPrimary">{new Date(detailModal.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {detailModal.endDate && (
                <div>
                  <p className="text-xs text-textSecondary">End Date</p>
                  <p className="text-sm text-textPrimary">{new Date(detailModal.endDate).toLocaleDateString()}</p>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Campaign"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>Delete</Button>
          </>
        }
      >
        <p className="text-textSecondary">
          Are you sure you want to delete <span className="text-text-textPrimary font-medium">{deleteModal?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
