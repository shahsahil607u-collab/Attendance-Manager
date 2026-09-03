import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDate } from '../utils/helpers';
import { Plus, Eye, Send, CalendarCheck } from 'lucide-react';

const Sessions = () => {
  const { isCoordinator } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', sessionName: 'Technical Team', topic: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchSessions(); }, [page]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sessions', { params: { page, limit: 15 } });
      setSessions(res.data.data.sessions);
      setPagination(res.data.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.topic) { setError('Topic is required.'); return; }
    setCreating(true); setError('');
    try {
      const res = await api.post('/sessions', form);
      navigate(`/sessions/${res.data.data._id}/mark`);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create session.'); } finally { setCreating(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Attendance Sessions</h1><p>Create and manage attendance sessions</p></div>
          {isCoordinator && <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={18} /> New Session</button>}
        </div>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Create New Session</h3></div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Session Name *</label><input className="form-input" value={form.sessionName} onChange={e => setForm({ ...form, sessionName: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Start Time *</label><input type="time" className="form-input" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">End Time *</label><input type="time" className="form-input" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Topic *</label><input className="form-input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g., Web Development" required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create & Mark Attendance'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : sessions.length === 0 ? (
        <EmptyState title="No sessions yet" message="Create your first attendance session." icon={CalendarCheck} />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Session</th><th>Topic</th><th>Time</th><th>Present</th><th>Absent</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id}>
                    <td>{formatDate(s.date)}</td>
                    <td><strong>{s.sessionName}</strong></td>
                    <td>{s.topic}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.startTime} – {s.endTime}</td>
                    <td><span style={{ color: 'var(--success-600)', fontWeight: 600 }}>{s.presentCount || 0}</span></td>
                    <td><span style={{ color: 'var(--danger-600)', fontWeight: 600 }}>{s.absentCount || 0}</span></td>
                    <td><span className={`badge badge-${s.status === 'submitted' ? 'success' : s.status === 'draft' ? 'warning' : 'gray'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => navigate(`/sessions/${s._id}`)}><Eye size={16} /></button>
                        {isCoordinator && s.status === 'draft' && <button className="btn btn-ghost btn-sm btn-icon" title="Mark Attendance" onClick={() => navigate(`/sessions/${s._id}/mark`)}><Send size={16} /></button>}
                      </div>
                    </td>
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

export default Sessions;
