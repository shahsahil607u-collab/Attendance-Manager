import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDateTime } from '../utils/helpers';

const ACTION_COLORS = {
  LOGIN: 'info', LOGOUT: 'gray', STUDENT_CREATED: 'success', STUDENT_UPDATED: 'info',
  STUDENT_DEACTIVATED: 'warning', SESSION_CREATED: 'success', ATTENDANCE_SUBMITTED: 'success',
  ATTENDANCE_CORRECTED: 'warning', REPORT_GENERATED: 'info', EMAIL_SENT: 'success', EMAIL_FAILED: 'danger',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const actions = ['LOGIN', 'LOGOUT', 'STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DEACTIVATED', 'SESSION_CREATED', 'ATTENDANCE_SUBMITTED', 'ATTENDANCE_CORRECTED', 'EMAIL_SENT', 'EMAIL_FAILED'];

  return (
    <div>
      <div className="page-header"><h1>Audit Logs</h1><p>System activity trail</p></div>
      <div className="toolbar">
        <select className="form-select" style={{ width: 'auto' }} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      {loading ? <LoadingSpinner /> : logs.length === 0 ? <EmptyState title="No audit logs" /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Description</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{formatDateTime(l.timestamp)}</td>
                    <td><span className={`badge badge-${ACTION_COLORS[l.action] || 'gray'}`}>{l.action.replace(/_/g, ' ')}</span></td>
                    <td>{l.performedBy?.name || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', maxWidth: 400 }}>{l.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer"><Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
