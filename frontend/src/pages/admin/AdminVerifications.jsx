import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export default function AdminVerifications() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { addToast } = useToast();

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingCompanies({ page, limit: 10 });
      if (response.data.success) {
        setCompanies(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      addToast('Failed to load pending verifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (companyId) => {
    setActionLoading((prev) => ({ ...prev, [companyId]: 'approve' }));
    try {
      await adminAPI.verifyCompany(companyId, 'verified');
      addToast('Company verified successfully', 'success');
      fetchPending();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to verify company', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [companyId]: null }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading((prev) => ({ ...prev, [rejectModal._id]: 'reject' }));
    try {
      await adminAPI.verifyCompany(rejectModal._id, 'rejected', rejectionReason);
      addToast('Company rejected', 'success');
      setRejectModal(null);
      setRejectionReason('');
      fetchPending();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to reject company', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [rejectModal._id]: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-4">
        {/* Verifications Section */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verification
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              <span className="text-gradient">Verifications</span>
            </h2>
            <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
              Review and process company verification requests
            </p>
          </div>
        </section>
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-textPrimary mb-2">All Caught Up!</h3>
            <p className="text-textSecondary">No pending verification requests.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Verifications Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verification
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            <span className="text-gradient">Verifications</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Review and process company verification requests
          </p>
        </div>
      </section>

      {companies.map((company) => (
        <Card key={company._id}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent-text font-bold text-xl">
                {company.companyName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-textPrimary">{company.companyName}</h3>
                  <Badge status="pending">Pending</Badge>
                </div>
                <p className="text-sm text-textSecondary">{company.industry}</p>
                <div className="flex items-center gap-4 text-xs text-textSecondary">
                  <span>{company.email}</span>
                  {company.website && <span>• {company.website}</span>}
                  {company.location && <span>• {company.location}</span>}
                  <span>• Applied {new Date(company.createdAt).toLocaleDateString()}</span>
                </div>
                {company.description && (
                  <p className="text-sm text-text-textSecondary/70 mt-2 max-w-2xl">{company.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectModal(company)}
                loading={actionLoading[company._id] === 'reject'}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(company._id)}
                loading={actionLoading[company._id] === 'approve'}
              >
                Approve
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-text-textSecondary px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectionReason(''); }}
        title="Reject Company Verification"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={!!rejectModal && !!actionLoading[rejectModal._id]}
            >
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
            placeholder="Enter rejection reason (required)..."
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
