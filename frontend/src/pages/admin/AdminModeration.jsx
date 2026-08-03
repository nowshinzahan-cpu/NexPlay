import { useState, useEffect, useCallback } from 'react';
import { moderationAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/ott/LoadingSkeleton';

const REASON_LABELS = {
  spam: 'Spam', harassment: 'Harassment', inappropriate: 'Inappropriate',
  misinformation: 'Misinformation', copyright: 'Copyright', other: 'Other'
};

export default function AdminModeration() {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [hideTarget, setHideTarget] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        moderationAPI.getReports({ status: statusFilter, page, limit: 20 }),
        moderationAPI.getStats()
      ]);
      if (reportsRes.data.success) {
        setReports(reportsRes.data.data);
        setTotalPages(reportsRes.data.meta?.totalPages || 1);
      }
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      addToast('Failed to load moderation data', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async (reportId, status) => {
    setSubmitting(true);
    try {
      await moderationAPI.resolveReport(reportId, {
        status,
        resolutionNote: resolutionNote || undefined,
        hideTarget,
        deleteTarget
      });
      addToast(`Report ${status}`, 'success');
      setShowModal(null);
      setResolutionNote('');
      setHideTarget(false);
      setDeleteTarget(false);
      fetchData();
    } catch (err) {
      addToast('Failed to resolve report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { key: 'pending', label: 'Pending', count: stats?.pending || 0 },
    { key: 'resolved', label: 'Resolved', count: stats?.resolved || 0 },
    { key: 'dismissed', label: 'Dismissed', count: stats?.dismissed || 0 }
  ];

  return (
    <div className="space-y-6">
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 sm:mb-5 border"
            style={{ backgroundColor: 'rgba(var(--color-accent), 0.12)', borderColor: 'rgba(var(--color-accent), 0.20)', color: 'rgb(var(--color-accent-text))' }}>
            Moderation
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Reports</span>
          </h2>
          <p className="text-sm sm:text-base mt-2 text-textSecondary">Review and resolve user reports</p>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {tabs.map(tab => (
          <div key={tab.key} className="card cursor-pointer" onClick={() => { setStatusFilter(tab.key); setPage(1); }}>
            <p className="text-xs text-text-textSecondary/60 uppercase tracking-wider">{tab.label}</p>
            <p className="text-2xl font-bold text-text-textPrimary mt-1">{tab.count}</p>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="inline-flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? 'text-accent-contrast font-bold shadow-md shadow-accent/30'
                : 'text-text-textSecondary hover:text-text-textPrimary hover:bg-[var(--hover-bg)]'
            }`}
            style={statusFilter === tab.key ? { background: 'var(--gradient-accent)' } : undefined}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-textSecondary text-sm">No {statusFilter} reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <Card key={report._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent/10 text-accent-text">{report.targetType}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-hover text-textSecondary">{REASON_LABELS[report.reason] || report.reason}</span>
                    <Badge status={report.status === 'pending' ? 'pending' : report.status === 'resolved' ? 'verified' : 'rejected'}>{report.status}</Badge>
                  </div>
                  {report.description && <p className="text-sm textPrimary/80 mb-2">{report.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-text-textSecondary/60">
                    <span>Reported by {report.reporterId?.fullName || report.reporterId?.username || 'Anonymous'}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.resolvedBy && <span>Resolved by {report.resolvedBy?.fullName || report.resolvedBy?.username}</span>}
                  </div>
                </div>
                {report.status === 'pending' && (
                  <Button variant="primary" size="sm" onClick={() => setShowModal(report)} className="shrink-0">
                    Review
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-[var(--hover-bg)] disabled:opacity-50">Previous</button>
          <span className="text-xs text-textSecondary">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-[var(--hover-bg)] disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Resolve Modal */}
      {showModal && (
        <Modal isOpen={!!showModal} onClose={() => setShowModal(null)}>
          <h3 className="text-lg font-bold text-text-textPrimary mb-4">Review Report</h3>
          <div className="text-sm text-text-textSecondary mb-4">
            <p><strong>Type:</strong> {showModal.targetType} • <strong>Reason:</strong> {REASON_LABELS[showModal.reason]}</p>
            {showModal.description && <p className="mt-2">"{showModal.description}"</p>}
            <p className="mt-2 text-[10px]">Reported by {showModal.reporterId?.fullName || 'Anonymous'} on {new Date(showModal.createdAt).toLocaleDateString()}</p>
          </div>
          <textarea className="input-field min-h-[60px] mb-3" placeholder="Resolution note (optional)" value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} />
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hideTarget} onChange={e => setHideTarget(e.target.checked)} className="w-4 h-4" />
              <span className="text-xs text-textPrimary">Hide content</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={deleteTarget} onChange={e => setDeleteTarget(e.target.checked)} className="w-4 h-4" />
              <span className="text-xs text-textPrimary">Delete content</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => handleResolve(showModal._id, 'resolved')} disabled={submitting} loading={submitting}>
              Resolve & Remove
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleResolve(showModal._id, 'dismissed')} disabled={submitting}>
              Dismiss
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowModal(null)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
