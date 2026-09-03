import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate, formatPercentage, getAttendanceColor } from '../utils/helpers';
import { Users, UserCheck, UserX, TrendingUp, CalendarCheck, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { isCoordinator } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, todayPresent: 0, todayAbsent: 0, todayPercentage: 0 });
  const [recentSessions, setRecentSessions] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, sessionsRes, reportRes] = await Promise.all([
        api.get('/students', { params: { isActive: true, limit: 1 } }),
        api.get('/sessions', { params: { limit: 5, sortBy: 'date', sortOrder: 'desc' } }),
        api.get('/reports/daily'),
      ]);
      const totalStudents = studentsRes.data.data.pagination.total;
      const sessions = sessionsRes.data.data.sessions;
      const dailySessions = reportRes.data.data.sessions || [];
      let todayPresent = 0, todayAbsent = 0;
      dailySessions.forEach(s => { todayPresent += s.presentCount; todayAbsent += s.absentCount; });
      const todayTotal = todayPresent + todayAbsent;
      setStats({ totalStudents, todayPresent, todayAbsent, todayPercentage: todayTotal > 0 ? (todayPresent / todayTotal) * 100 : 0 });
      setRecentSessions(sessions);

      // Fetch monthly report for low attendance
      try {
        const monthlyRes = await api.get('/reports/monthly');
        setLowAttendance(monthlyRes.data.data.belowThreshold || []);
      } catch { /* monthly may not have data yet */ }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const pieData = [
    { name: 'Present', value: stats.todayPresent, color: '#22c55e' },
    { name: 'Absent', value: stats.todayAbsent, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = recentSessions.filter(s => s.totalStudents > 0).slice(0, 7).reverse().map(s => ({
    name: formatDate(s.date),
    present: s.presentCount,
    absent: s.absentCount,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your attendance overview.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="blue" sub="Active members" />
        <StatCard icon={UserCheck} label="Today Present" value={stats.todayPresent} color="green" />
        <StatCard icon={UserX} label="Today Absent" value={stats.todayAbsent} color="red" />
        <StatCard icon={TrendingUp} label="Today's Attendance" value={formatPercentage(stats.todayPercentage)} color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: barData.length > 0 ? '2fr 1fr' : '1fr', gap: 20, marginBottom: 24 }}>
        {barData.length > 0 && (
          <div className="chart-card">
            <h3>Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {pieData.length > 0 && (
          <div className="chart-card">
            <h3>Today's Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3><CalendarCheck size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Recent Sessions</h3>
          </div>
          <div className="table-container">
            {recentSessions.length === 0 ? (
              <EmptyState title="No sessions yet" message="Create your first attendance session." />
            ) : (
              <table>
                <thead><tr><th>Date</th><th>Session</th><th>Present</th><th>Absent</th><th>Status</th></tr></thead>
                <tbody>
                  {recentSessions.map(s => (
                    <tr key={s._id} className="clickable" onClick={() => navigate(`/sessions/${s._id}`)}>
                      <td>{formatDate(s.date)}</td>
                      <td><strong>{s.sessionName}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{s.topic}</span></td>
                      <td><span style={{ color: 'var(--success-600)', fontWeight: 600 }}>{s.presentCount}</span></td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: 600 }}>{s.absentCount}</span></td>
                      <td><span className={`badge badge-${s.status === 'submitted' ? 'success' : s.status === 'draft' ? 'warning' : 'gray'}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><AlertTriangle size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Low Attendance Students</h3>
          </div>
          <div className="table-container">
            {lowAttendance.length === 0 ? (
              <EmptyState title="All good!" message="No students below attendance threshold." />
            ) : (
              <table>
                <thead><tr><th>Student</th><th>Roll No</th><th>Attendance</th></tr></thead>
                <tbody>
                  {lowAttendance.slice(0, 8).map(s => (
                    <tr key={s.student._id} className="clickable" onClick={() => navigate(`/students/${s.student._id}`)}>
                      <td>{s.student.fullName}</td>
                      <td>{s.student.rollNumber}</td>
                      <td><span style={{ color: getAttendanceColor(s.attendancePercentage), fontWeight: 600 }}>⚠ {formatPercentage(s.attendancePercentage)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
