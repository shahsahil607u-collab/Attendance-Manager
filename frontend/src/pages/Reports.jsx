import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatPercentage, getAttendanceColor } from '../utils/helpers';
import { Download } from 'lucide-react';

const Reports = () => {
  const [tab, setTab] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchReport(); }, [tab, month, year, date]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (tab === 'monthly') {
        const res = await api.get('/reports/monthly', { params: { month, year } });
        setData(res.data.data);
      } else {
        const res = await api.get('/reports/daily', { params: { date } });
        setData(res.data.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleExport = () => {
    const params = tab === 'monthly' ? `type=monthly&month=${month}&year=${year}` : `type=daily&date=${date}`;
    window.open(`${import.meta.env.VITE_API_URL}/reports/export?${params}`, '_blank');
  };

  const tabs = [{ key: 'monthly', label: 'Monthly' }, { key: 'daily', label: 'Daily' }];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Reports</h1><p>Attendance reports and analytics</p></div>
          <button className="btn btn-outline" onClick={handleExport}><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        {tab === 'monthly' ? (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Month</label>
              <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year</label>
              <select className="form-select" value={year} onChange={e => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        )}
      </div>

      {loading ? <LoadingSpinner /> : !data ? <EmptyState title="No data" /> : tab === 'monthly' ? (
        <div>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card"><div className="stat-info"><div className="stat-label">Total Sessions</div><div className="stat-value">{data.totalSessions}</div></div></div>
            <div className="stat-card"><div className="stat-info"><div className="stat-label">Total Students</div><div className="stat-value">{data.totalStudents}</div></div></div>
            <div className="stat-card"><div className="stat-info"><div className="stat-label">Avg Attendance</div><div className="stat-value">{formatPercentage(data.averageAttendance)}</div></div></div>
            <div className="stat-card"><div className="stat-info"><div className="stat-label">Below {data.threshold}%</div><div className="stat-value" style={{ color: 'var(--danger-600)' }}>{data.belowThreshold?.length || 0}</div></div></div>
          </div>
          {data.studentStats?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Student Attendance Summary</h3></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Student</th><th>Roll No</th><th>Classes</th><th>Present</th><th>Absent</th><th>Percentage</th></tr></thead>
                  <tbody>
                    {data.studentStats.filter(s => s.totalClasses > 0).sort((a, b) => a.attendancePercentage - b.attendancePercentage).map(s => (
                      <tr key={s.student._id}>
                        <td>{s.student.fullName}</td><td>{s.student.rollNumber}</td>
                        <td>{s.totalClasses}</td><td>{s.presentCount}</td><td>{s.absentCount}</td>
                        <td><span style={{ fontWeight: 600, color: getAttendanceColor(s.attendancePercentage, data.threshold) }}>{formatPercentage(s.attendancePercentage)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {data.sessions?.length === 0 ? <EmptyState title="No sessions on this date" /> : data.sessions.map(s => (
            <div key={s.session._id} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><h3>{s.session.sessionName} – {s.session.topic}</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                  <span>Total: <strong>{s.totalStudents}</strong></span>
                  <span>Present: <strong style={{ color: 'var(--success-600)' }}>{s.presentCount}</strong></span>
                  <span>Absent: <strong style={{ color: 'var(--danger-600)' }}>{s.absentCount}</strong></span>
                  <span>Attendance: <strong>{formatPercentage(s.attendancePercentage)}</strong></span>
                </div>
                {s.absentStudents?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>Absent Students:</div>
                    {s.absentStudents.map((st, i) => <span key={i} className="badge badge-danger" style={{ marginRight: 6, marginBottom: 4 }}>{st.fullName} ({st.rollNumber})</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
