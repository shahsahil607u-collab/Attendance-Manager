import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDateTime, getErrorMessage } from '../utils/helpers';
import { RefreshCw, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

const Notifications = () => {
  const { isCoordinator } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('');
  const [retrying, setRetrying] = useState(null);

  useEffect(() => { fetchNotifications(); }, [page, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.status = filter;
      const res = await api.get('/notifications', { params });
      setNotifications(res.data.data.notifications);
      setPagination(res.data.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleRetry = async (id) => {
    setRetrying(id);
    try {
      await api.post(`/notifications/${id}/retry`);
      fetchNotifications();
    } catch (err) { alert(getErrorMessage(err)); } finally { setRetrying(null); }
  };

  const statusIcon = (status) => {
    if (status === 'sent') return <CheckCircle size={14} color="var(--success-600)" />;
    if (status === 'failed') return <XCircle size={14} color="var(--danger-600)" />;
    return <Clock size={14} color="var(--warning-600)" />;
  };

  return (
    <div>
      <div className="page-header"><h1>Notifications</h1><p>Email notification history and status</p></div>
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <strong>📧 Email Service Status:</strong> Notifications are generated automatically when attendance is submitted. 
        Click <strong>View Email</strong> on any sent notification to view the exact HTML email preview. 
        To deliver emails directly to a real Gmail inbox, enter your <code>SMTP_USER</code> &amp; Gmail 16-digit App Password in <code>backend/.env</code>.
      </div>
      <div className="toolbar">
        <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : notifications.length === 0 ? <EmptyState title="No notifications" message="Notifications will appear here after attendance is submitted." /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Type</th><th>Recipient</th><th>Status</th><th>Sent At</th><th>Retries</th>{isCoordinator && <th>Action</th>}</tr></thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n._id}>
                    <td>{n.studentId?.fullName || 'HOD'}<br/><span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{n.studentId?.rollNumber || ''}</span></td>
                    <td><span className="badge badge-info">{n.type === 'absent_email' ? 'Absent Email' : 'HOD Report'}</span></td>
                    <td style={{ fontSize: '0.8125rem' }}>{n.recipient}</td>
                    <td><span className={`badge badge-${n.status === 'sent' ? 'success' : n.status === 'failed' ? 'danger' : 'warning'}`}>{statusIcon(n.status)} {n.status}</span>
                      {n.errorMessage && <div style={{ fontSize: '0.7rem', color: 'var(--danger-600)', marginTop: 2 }}>{n.errorMessage}</div>}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{n.sentAt ? formatDateTime(n.sentAt) : '—'}</td>
                    <td>{n.retryCount}</td>
                    {isCoordinator && (
                      <td>
                        {n.previewUrl && (
                          <a href={n.previewUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginRight: 6 }}>
                            <ExternalLink size={14} /> View Email
                          </a>
                        )}
                        {n.status === 'failed' && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleRetry(n._id)} disabled={retrying === n._id}>
                            <RefreshCw size={14} className={retrying === n._id ? 'spinning' : ''} /> Retry
                          </button>
                        )}
                      </td>
                    )}
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

export default Notifications;
