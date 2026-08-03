import { useState, useEffect, useCallback } from 'react';
import { companyAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import DataTable from '../../components/DataTable';

export default function CompanyAdvertisements() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
    placement: 'banner',
    budget: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await companyAPI.getAdvertisements({ page, limit: 10 });
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
  }, [page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setActionLoading(true);
    try {
      const result = await companyAPI.createAdvertisement(formData);
      if (result.data.success) {
        addToast('Advertisement created. Pending review.', 'success');
        setCreateModal(false);
        setFormData({ title: '', description: '', targetUrl: '', placement: 'banner', budget: '' });
        fetchAds();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create advertisement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await companyAPI.deleteAdvertisement(deleteModal._id);
      addToast('Advertisement deleted', 'success');
      setDeleteModal(null);
      fetchAds();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadgeMap = {
    pending: 'pending',
    active: 'verified',
    paused: 'warning',
    rejected: 'rejected',
    expired: 'danger'
  };

  const columns = [
    {
      key: 'title',
      label: 'Advertisement',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-textPrimary">{row.title}</p>
          {row.description && (
            <p className="text-xs text-text-textSecondary mt-0.5 truncate max-w-xs">{row.description}</p>
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
          {(row.status === 'pending' || row.status === 'draft') && (
            <Button variant="danger" size="sm" onClick={() => setDeleteModal(row)}>
              Delete
            </Button>
          )}
          {row.status === 'rejected' && row.rejectionReason && (
            <span className="text-xs text-danger" title={row.rejectionReason}>
              Rejected
            </span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Advertisements
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                My <span className="text-gradient">Advertisements</span>
              </h2>
              <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                Create and manage your promotional campaigns
              </p>
            </div>
            <Button variant="primary" onClick={() => setCreateModal(true)} className="shrink-0">
              Create Advertisement
            </Button>
          </div>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={ads}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyMessage="No advertisements yet. Create your first one!"
      />

      {/* Create Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => { setCreateModal(false); setFormData({ title: '', description: '', targetUrl: '', placement: 'banner', budget: '' }); }}
        title="Create Advertisement"
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
            label="Title *"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            error={formErrors.title}
            placeholder="Enter advertisement title"
          />
          <div>
            <label className="block text-sm font-medium text-text-textSecondary mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe your advertisement"
            />
          </div>
          <Input
            label="Target URL"
            name="targetUrl"
            value={formData.targetUrl}
            onChange={(e) => setFormData((p) => ({ ...p, targetUrl: e.target.value }))}
            placeholder="https://example.com"
          />
          <div>
            <label className="block text-sm font-medium text-text-textSecondary mb-1.5">Placement</label>
            <select
              value={formData.placement}
              onChange={(e) => setFormData((p) => ({ ...p, placement: e.target.value }))}
              className="input-field"
            >
              <option value="banner">Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="popup">Popup</option>
              <option value="featured">Featured</option>
            </select>
          </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Advertisement"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>Delete</Button>
          </>
        }
      >
        <p className="text-textSecondary">
          Are you sure you want to delete <span className="text-text-textPrimary font-medium">{deleteModal?.title}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
