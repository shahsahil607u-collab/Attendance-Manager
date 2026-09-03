import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatPercentage, getAttendanceColor } from '../utils/helpers';
import { ArrowLeft, Mail, Phone, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/reports/student/${id}`).then(res => { setData(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="alert alert-error">Student not found.</div>;

  const { student, totalClasses, presentCount, absentCount, attendancePercentage, isBelowThreshold, threshold, attendance } = data;
  const chartData = (attendance || []).filter(a => a.sessionId).reverse().map((a, i) => ({
    name: formatDate(a.sessionId.date),
    status: a.status === 'present' ? 1 : 0,
  }));

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><ArrowLeft size={18} /> Back</button>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{student.fullName}</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
              <span><BookOpen size={14} style={{ verticalAlign: 'text-bottom' }} /> {student.rollNumber}</span>
              <span><Mail size={14} style={{ verticalAlign: 'text-bottom' }} /> {student.email}</span>
              <span><Phone size={14} style={{ verticalAlign: 'text-bottom' }} /> {student.phone}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: 4 }}>
              {student.department} • Sem {student.semester} • Year {student.year}
            </div>
            {isBelowThreshold && <div className="alert alert-warning" style={{ marginTop: 12 }}>⚠ Attendance below {threshold}% threshold</div>}
          </div>
          <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Classes</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalClasses}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Present</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-600)' }}>{presentCount}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Absent</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-600)' }}>{absentCount}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Attendance</div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: getAttendanceColor(attendancePercentage) }}>{formatPercentage(attendancePercentage)}</div></div>
          </div>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="chart-card" style={{ marginBottom: 24 }}>
          <h3>Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={v => v === 1 ? 'P' : 'A'} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip formatter={v => v === 1 ? 'Present' : 'Absent'} />
              <Line type="stepAfter" dataKey="status" stroke="var(--primary-500)" strokeWidth={2} dot={{ fill: 'var(--primary-500)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3>Attendance History</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Session</th><th>Topic</th><th>Status</th></tr></thead>
            <tbody>
              {(attendance || []).filter(a => a.sessionId).map(a => (
                <tr key={a._id}>
                  <td>{formatDate(a.sessionId.date)}</td>
                  <td>{a.sessionId.sessionName}</td>
                  <td>{a.sessionId.topic}</td>
                  <td><span className={`badge ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
