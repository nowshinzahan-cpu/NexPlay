import { useState, useEffect, useCallback } from 'react';
import { platformAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/ott/LoadingSkeleton';
import EmptyState from '../../components/ott/EmptyState';

function PlatformForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    website: initial?.website || '',
    logo: initial?.logo || '',
    description: initial?.description || '',
    supportedRegions: initial?.supportedRegions?.join(', ') || '',
    contentTypes: initial?.contentTypes?.join(', ') || 'ALL'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSubmit({
      ...form,
      supportedRegions: form.supportedRegions.split(',').map(r => r.trim()).filter(Boolean),
      contentTypes: form.contentTypes.split(',').map(c => c.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Platform Name *"
          name="name"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          label="Website"
          name="website"
          value={form.website}
          onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>
      <Input
        label="Logo URL"
        name="logo"
        value={form.logo}
        onChange={(e) => setForm(f => ({ ...f, logo: e.target.value }))}
        placeholder="https://example.com/logo.png"
      />
      <Input
        label="Description"
        name="description"
        value={form.description}
        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Supported Regions (comma-separated)"
          name="supportedRegions"
          value={form.supportedRegions}
          onChange={(e) => setForm(f => ({ ...f, supportedRegions: e.target.value }))}
          placeholder="US, UK, Canada, India"
        />
        <Input
          label="Content Types (comma-separated)"
          name="contentTypes"
          value={form.contentTypes}
          onChange={(e) => setForm(f => ({ ...f, contentTypes: e.target.value }))}
          placeholder="MOVIE, TV_SERIES, SPORTS"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Update Platform' : 'Add Platform'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AdminPlatforms() {
  const { addToast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformAPI.getAllPlatforms();
      if (res.data.success) setPlatforms(res.data.data);
    } catch (err) {
      addToast('Failed to load platforms', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPlatforms(); }, [fetchPlatforms]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await platformAPI.createPlatform(data);
      addToast('Platform added successfully!', 'success');
      setShowModal(false);
      fetchPlatforms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add platform', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await platformAPI.updatePlatform(editing._id, data);
      addToast('Platform updated successfully!', 'success');
      setEditing(null);
      setShowModal(false);
      fetchPlatforms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update platform', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await platformAPI.deletePlatform(id);
      addToast('Platform deleted', 'success');
      fetchPlatforms();
    } catch (err) {
      addToast('Failed to delete platform', 'error');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (platform) => {
    setEditing(platform);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Platform
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                Streaming <span className="text-gradient">Platforms</span>
              </h2>
              <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                Manage the directory of supported streaming platforms
              </p>
            </div>
            <Button variant="primary" onClick={openCreate} className="shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Platform
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingSkeleton count={5} />
      ) : platforms.length === 0 ? (
        <EmptyState type="empty" message="No streaming platforms configured yet." />
      ) : (
        <div className="space-y-3">
          {platforms.map((platform) => (
            <Card key={platform._id}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {platform.logo ? (
                    <img src={platform.logo} alt={platform.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-accent-text font-bold text-lg">{platform.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-textPrimary">{platform.name}</h3>
                    {!platform.isActive && (
                      <span className="text-[10px] bg-danger/10 text-danger px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  {platform.website && (
                    <a href={platform.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-accent-text hover:text-accent-text/80 transition-colors">
                      {platform.website}
                    </a>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {platform.contentTypes?.map(t => (
                      <span key={t} className="text-[10px] bg-[var(--hover-bg)] text-text-textSecondary px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  {platform.supportedRegions?.length > 0 && (
                    <p className="text-[10px] text-text-textSecondary/60 mt-1">
                      Regions: {platform.supportedRegions.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(platform)}
                    title="Edit platform"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const updated = { ...platform, isActive: !platform.isActive };
                        await platformAPI.updatePlatform(platform._id, updated);
                        addToast(`Platform ${platform.isActive ? 'deactivated' : 'activated'}`, 'success');
                        fetchPlatforms();
                      } catch (err) {
                        addToast('Failed to toggle platform status', 'error');
                      }
                    }}
                    title={platform.isActive ? 'Deactivate platform' : 'Activate platform'}
                    className={platform.isActive ? 'text-warning hover:text-warning hover:bg-warning/10' : 'text-success hover:text-success hover:bg-success/10'}
                  >
                    {platform.isActive ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10"
                    onClick={() => handleDelete(platform._id)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} size="lg">
        <h2 className="text-xl font-bold text-text-textPrimary mb-4">
          {editing ? 'Edit Platform' : 'Add New Platform'}
        </h2>
        <PlatformForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeModal}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
