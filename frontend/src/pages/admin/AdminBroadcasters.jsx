import { useState, useEffect, useCallback } from 'react';
import { broadcasterAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/ott/LoadingSkeleton';
import EmptyState from '../../components/ott/EmptyState';

function BroadcasterForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    logoUrl: initial?.logoUrl || '',
    website: initial?.website || '',
    regions: initial?.regions?.join(', ') || '',
    isOfficial: initial?.isOfficial !== undefined ? initial.isOfficial : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSubmit({
      ...form,
      regions: form.regions.split(',').map(r => r.trim()).filter(Boolean)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Broadcaster Name *" name="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
      <Input label="Logo URL" name="logoUrl" value={form.logoUrl} onChange={(e) => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://example.com/logo.png" />
      <Input label="Website" name="website" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
      <Input label="Regions (comma-separated)" name="regions" value={form.regions} onChange={(e) => setForm(f => ({ ...f, regions: e.target.value }))} placeholder="US, UK, Canada, India" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isOfficial} onChange={(e) => setForm(f => ({ ...f, isOfficial: e.target.checked }))} className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent" />
        <span className="text-sm text-textPrimary">Official Broadcaster</span>
      </label>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Broadcaster'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AdminBroadcasters() {
  const { addToast } = useToast();
  const [broadcasters, setBroadcasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBroadcasters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await broadcasterAPI.getAll();
      if (res.data.success) setBroadcasters(res.data.data);
    } catch (err) {
      addToast('Failed to load broadcasters', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchBroadcasters(); }, [fetchBroadcasters]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await broadcasterAPI.create(data);
      addToast('Broadcaster added!', 'success');
      setShowModal(false);
      fetchBroadcasters();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await broadcasterAPI.update(editing._id, data);
      addToast('Broadcaster updated!', 'success');
      setEditing(null);
      setShowModal(false);
      fetchBroadcasters();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await broadcasterAPI.delete(id);
      addToast('Broadcaster deleted', 'success');
      fetchBroadcasters();
    } catch (err) {
      addToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 sm:mb-5 border"
            style={{ backgroundColor: 'rgba(var(--color-accent), 0.12)', borderColor: 'rgba(var(--color-accent), 0.20)', color: 'rgb(var(--color-accent-text))' }}>
            Broadcast
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                <span className="text-gradient">Broadcasters</span>
              </h2>
              <p className="text-sm sm:text-base mt-2 text-textSecondary">Manage streaming broadcasters and regions</p>
            </div>
            <Button variant="primary" onClick={() => { setEditing(null); setShowModal(true); }} className="shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Broadcaster
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingSkeleton count={5} />
      ) : broadcasters.length === 0 ? (
        <EmptyState type="empty" message="No broadcasters configured yet." />
      ) : (
        <div className="space-y-3">
          {broadcasters.map((b) => (
            <Card key={b._id}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {b.logoUrl ? <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain" /> : <span className="text-accent-text font-bold text-lg">{b.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-textPrimary">{b.name}</h3>
                    {b.isOfficial && <span className="text-[10px] bg-accent/10 text-accent-text px-1.5 py-0.5 rounded">Official</span>}
                  </div>
                  {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-text/70 hover:underline">{b.website}</a>}
                  {b.regions?.length > 0 && <p className="text-[10px] text-text-textSecondary/70 mt-1">Regions: {b.regions.join(', ')}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(b); setShowModal(true); }} title="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={() => handleDelete(b._id)} title="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} size="lg">
        <h2 className="text-xl font-bold text-text-textPrimary mb-4">{editing ? 'Edit Broadcaster' : 'Add New Broadcaster'}</h2>
        <BroadcasterForm initial={editing} onSubmit={editing ? handleUpdate : handleCreate} onCancel={() => { setShowModal(false); setEditing(null); }} loading={submitting} />
      </Modal>
    </div>
  );
}
