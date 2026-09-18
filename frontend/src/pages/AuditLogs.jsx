import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDateTime } from '../utils/helpers';
import { Trash2 } from 'lucide-react';

const ACTION_COLORS = {
  LOGIN: 'info', LOGOUT: 'gray', STUDENT_CREATED: 'success', STUDENT_UPDATED: 'info',
  STUDENT_DEACTIVATED: 'warning', SESSION_CREATED: 'success', ATTENDANCE_SUBMITTED: 'success',
  ATTENDANCE_CORRECTED: 'warning', REPORT_GENERATED: 'info', EMAIL_SENT: 'success', EMAIL_FAILED: 'danger',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (actionFilter) params.action = actionFilter;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this audit log entry?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/audit-logs/${id}`);
      setLogs(prev => prev.filter(l => l._id !== id));
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to delete audit log entry.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    const confirmMsg = actionFilter
      ? `Are you sure you want to delete all "${actionFilter.replace(/_/g, ' ')}" audit logs? This cannot be undone.`
      : 'Are you sure you want to delete ALL audit logs? This cannot be undone.';
    if (!window.confirm(confirmMsg)) return;

    setClearing(true);
    try {
      const params = actionFilter ? { action: actionFilter } : {};
      await api.delete('/audit-logs', { params });
      setPage(1);
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert('Failed to clear audit logs.');
    } finally {
      setClearing(false);
    }
  };

  const actions = ['LOGIN', 'LOGOUT', 'STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DEACTIVATED', 'SESSION_CREATED', 'ATTENDANCE_SUBMITTED', 'ATTENDANCE_CORRECTED', 'EMAIL_SENT', 'EMAIL_FAILED'];

  return (
    <div>
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>System activity trail and history</p>
      </div>

      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Actions</option>
            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        {logs.length > 0 && (
          <button
            className="btn btn-outline btn-sm"
            style={{
              color: 'var(--danger-600)',
              borderColor: 'var(--danger-300)',
              gap: 6,
              alignItems: 'center',
            }}
            onClick={handleClearAll}
            disabled={clearing}
          >
            <Trash2 size={14} />
            {clearing ? 'Clearing...' : actionFilter ? `Clear ${actionFilter.replace(/_/g, ' ')} Logs` : 'Clear All Logs'}
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : logs.length === 0 ? <EmptyState title="No audit logs" message="No activity logs match your current filter." /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{formatDateTime(l.timestamp)}</td>
                    <td><span className={`badge badge-${ACTION_COLORS[l.action] || 'gray'}`}>{l.action.replace(/_/g, ' ')}</span></td>
                    <td>{l.performedBy?.name || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: 400 }}>{l.description}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{
                          color: 'var(--danger-600)',
                          borderColor: 'var(--danger-200)',
                          padding: '4px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onClick={() => handleDelete(l._id)}
                        disabled={deletingId === l._id}
                        title="Delete this audit log"
                      >
                        <Trash2 size={13} />
                        {deletingId === l._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
