import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDate } from '../utils/helpers';
import { Eye } from 'lucide-react';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { fetchSessions(); }, [page, startDate, endDate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20, sortBy: 'date', sortOrder: 'desc' };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/sessions', { params });
      setSessions(res.data.data.sessions);
      setPagination(res.data.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><h1>Attendance History</h1><p>View past attendance sessions</p></div>
      <div className="toolbar">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">From</label>
          <input type="date" className="form-input" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">To</label>
          <input type="date" className="form-input" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
        </div>
        {(startDate || endDate) && <button className="btn btn-ghost btn-sm" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ alignSelf: 'flex-end' }}>Clear</button>}
      </div>
      {loading ? <LoadingSpinner /> : sessions.length === 0 ? <EmptyState title="No sessions found" /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Session</th><th>Topic</th><th>Present</th><th>Absent</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id} className="clickable" onClick={() => navigate(`/sessions/${s._id}`)}>
                    <td>{formatDate(s.date)}</td><td><strong>{s.sessionName}</strong></td><td>{s.topic}</td>
                    <td><span style={{ color: 'var(--success-600)', fontWeight: 600 }}>{s.presentCount}</span></td>
                    <td><span style={{ color: 'var(--danger-600)', fontWeight: 600 }}>{s.absentCount}</span></td>
                    <td><span className={`badge badge-${s.status === 'submitted' ? 'success' : s.status === 'draft' ? 'warning' : 'gray'}`}>{s.status}</span></td>
                    <td><button className="btn btn-ghost btn-sm btn-icon"><Eye size={16} /></button></td>
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

export default AttendanceHistory;
