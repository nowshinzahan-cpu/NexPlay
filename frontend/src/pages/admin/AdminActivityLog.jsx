import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { timeAgo } from '../../utils';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';

const actionColors = {
  USER_DELETED: 'danger',
  USER_BLOCKED: 'warning',
  USER_UNBLOCKED: 'success',
  COMPANY_VERIFIED: 'verified',
  COMPANY_REJECTED: 'rejected'
};

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { addToast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getActivityLog({ page, limit: 15 });
      if (response.data.success) {
        setLogs(response.data.data);
        setTotalPages(response.data.meta.totalPages);
        setTotal(response.data.meta.total);
      }
    } catch (error) {
      addToast('Failed to load activity log', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <Badge status={actionColors[row.action] || 'pending'}>
          {row.action?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      )
    },
    {
      key: 'details',
      label: 'Details',
      render: (row) => (
        <p className="text-sm text-textPrimary max-w-xs truncate">{row.details}</p>
      )
    },
    {
      key: 'admin',
      label: 'Admin',
      render: (row) => (
        <span className="text-sm text-textSecondary">{row.adminId?.fullName || row.adminId?.email || 'Unknown'}</span>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (row) => (
        <span className="text-sm text-text-textSecondary font-mono">{row.ipAddress || '—'}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (row) => (
        <span className="text-sm text-textSecondary">{timeAgo(row.createdAt)}</span>
      )
    }
  ];

  return (
    <div>
      {/* Activity Log Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Activity
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Activity <span className="text-gradient">Log</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Track all administrative actions and system events
          </p>
        </div>
      </section>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyMessage="No activity logs found"
      />
    </div>
  );
}
