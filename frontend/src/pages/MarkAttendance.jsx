import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { formatDate, formatPercentage, getErrorMessage } from '../utils/helpers';
import { ArrowLeft, Search, CheckCircle, XCircle, CheckCheck, Send } from 'lucide-react';

const MarkAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionRes, studentsRes] = await Promise.all([
        api.get(`/sessions/${id}`),
        api.get('/students', { params: { isActive: true, limit: 500, sortBy: 'rollNumber', sortOrder: 'asc' } }),
      ]);
      const sess = sessionRes.data.data.session;
      setSession(sess);
      const allStudents = studentsRes.data.data.students;
      setStudents(allStudents);

      // Load existing attendance if any
      const existing = sessionRes.data.data.attendance || [];
      const att = {};
      existing.forEach(a => { if (a.studentId) att[a.studentId._id] = a.status; });
      // Default all to present if no existing records
      if (existing.length === 0) {
        allStudents.forEach(s => { att[s._id] = 'present'; });
      }
      setAttendance(att);

      if (sess.status !== 'draft') {
        setError('Attendance for this session has already been submitted.');
      }
    } catch (err) { setError(getErrorMessage(err)); } finally { setLoading(false); }
  };

  const toggleStatus = (studentId) => {
    if (session?.status !== 'draft') return;
    setAttendance(prev => ({ ...prev, [studentId]: prev[studentId] === 'present' ? 'absent' : 'present' }));
  };

  const markAll = (status) => {
    const att = {};
    students.forEach(s => { att[s._id] = status; });
    setAttendance(att);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/mark', { sessionId: id, records });
    } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      // Save first
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/mark', { sessionId: id, records });
      // Then submit
      await api.post(`/sessions/${id}/submit`);
      navigate(`/sessions/${id}`);
    } catch (err) { setError(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner text="Loading attendance..." />;

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const total = presentCount + absentCount;
  const percentage = total > 0 ? (presentCount / total) * 100 : 0;
  const isSubmitted = session?.status !== 'draft';

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('/sessions')} style={{ marginBottom: 16 }}><ArrowLeft size={18} /> Back to Sessions</button>

      {/* Session Info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>{session?.sessionName} – {session?.topic}</h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{formatDate(session?.date)} • {session?.startTime} – {session?.endTime}</div>
          </div>
          <span className={`badge badge-${session?.status === 'submitted' ? 'success' : 'warning'}`} style={{ fontSize: '0.8125rem', padding: '4px 14px' }}>
            {session?.status === 'draft' ? '📝 Draft' : '✓ Submitted'}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {!isSubmitted && (
        <>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-input" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input className="form-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => markAll('present')}><CheckCheck size={16} /> Mark All Present</button>
            <button className="btn btn-outline btn-sm" onClick={() => markAll('absent')}><XCircle size={16} /> Mark All Absent</button>
            <button className="btn btn-outline btn-sm" onClick={saveAttendance} disabled={saving}>{saving ? 'Saving...' : 'Save Draft'}</button>
          </div>

          {/* Student List */}
          <div className="card">
            <div className="table-container">
              <table>
                <thead><tr><th style={{ width: 60 }}>#</th><th>Roll No</th><th>Student Name</th><th style={{ width: 200 }}>Status</th></tr></thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s._id} style={{ background: attendance[s._id] === 'absent' ? 'var(--danger-50)' : undefined }}>
                      <td>{i + 1}</td>
                      <td><strong>{s.rollNumber}</strong></td>
                      <td>{s.fullName}</td>
                      <td>
                        <div className="attendance-controls">
                          <button className={`attendance-btn present ${attendance[s._id] === 'present' ? 'active' : ''}`} onClick={() => toggleStatus(s._id)}>
                            <CheckCircle size={14} /> Present
                          </button>
                          <button className={`attendance-btn absent ${attendance[s._id] === 'absent' ? 'active' : ''}`} onClick={() => toggleStatus(s._id)}>
                            <XCircle size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sticky Summary */}
            <div className="attendance-summary-bar">
              <div className="summary-stats">
                <div className="summary-stat"><div className="label">Total</div><div className="value">{total}</div></div>
                <div className="summary-stat"><div className="label">Present</div><div className="value present">{presentCount}</div></div>
                <div className="summary-stat"><div className="label">Absent</div><div className="value absent">{absentCount}</div></div>
                <div className="summary-stat"><div className="label">Attendance</div><div className="value">{formatPercentage(percentage)}</div></div>
              </div>
              <button className="btn btn-success btn-lg" onClick={() => setShowConfirm(true)} disabled={total === 0}>
                <Send size={18} /> Submit Attendance
              </button>
            </div>
          </div>
        </>
      )}

      {isSubmitted && (
        <div className="card">
          <div className="card-header"><h3>Attendance Records</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s._id} style={{ background: attendance[s._id] === 'absent' ? 'var(--danger-50)' : undefined }}>
                    <td>{i + 1}</td><td>{s.rollNumber}</td><td>{s.fullName}</td>
                    <td><span className={`badge ${attendance[s._id] === 'present' ? 'badge-success' : 'badge-danger'}`}>{attendance[s._id] || 'N/A'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Attendance Submission"
        footer={<>
          <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Confirm & Submit'}</button>
        </>}>
        <p style={{ marginBottom: 16 }}>You are about to submit attendance for this session.</p>
        <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--gray-500)' }}>Total Students:</span><strong>{total}</strong>
            <span style={{ color: 'var(--gray-500)' }}>Present:</span><strong style={{ color: 'var(--success-600)' }}>{presentCount}</strong>
            <span style={{ color: 'var(--gray-500)' }}>Absent:</span><strong style={{ color: 'var(--danger-600)' }}>{absentCount}</strong>
            <span style={{ color: 'var(--gray-500)' }}>Attendance:</span><strong>{formatPercentage(percentage)}</strong>
          </div>
        </div>
        <div className="alert alert-info" style={{ marginBottom: 0 }}>
          Once submitted, attendance will be locked. Absent students will receive email notifications (if SMTP is configured).
        </div>
      </Modal>
    </div>
  );
};

export default MarkAttendance;
