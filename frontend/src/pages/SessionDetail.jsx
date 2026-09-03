import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { formatDate, formatPercentage, getErrorMessage } from '../utils/helpers';
import { ArrowLeft, Edit } from 'lucide-react';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isCoordinator } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reason, setReason] = useState('');
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => { fetchData(); }, [id]);
  const fetchData = async () => {
    try { const res = await api.get(`/sessions/${id}`); setData(res.data.data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openCorrection = (record) => { setSelectedRecord(record); setReason(''); setShowCorrection(true); };
  const handleCorrection = async () => {
    if (!reason.trim() || reason.length < 5) { alert('Please provide a reason (min 5 chars).'); return; }
    setCorrecting(true);
    try {
      const newStatus = selectedRecord.status === 'present' ? 'absent' : 'present';
      await api.post('/attendance/correction', { attendanceId: selectedRecord._id, newStatus, reason });
      setShowCorrection(false); fetchData();
    } catch (err) { alert(getErrorMessage(err)); } finally { setCorrecting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="alert alert-error">Session not found.</div>;
  const { session, attendance, summary } = data;

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><ArrowLeft size={18} /> Back</button>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{session.sessionName} – {session.topic}</h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: 4 }}>{formatDate(session.date)} • {session.startTime} – {session.endTime}</div>
              {session.description && <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 8 }}>{session.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Total</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{summary.totalStudents}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Present</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success-600)' }}>{summary.presentCount}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Absent</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger-600)' }}>{summary.absentCount}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>%</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatPercentage(summary.attendancePercentage)}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Attendance Records</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Status</th><th>Corrections</th>{isCoordinator && session.status !== 'draft' && <th>Action</th>}</tr></thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={a._id} style={{ background: a.status === 'absent' ? 'var(--danger-50)' : undefined }}>
                  <td>{i + 1}</td>
                  <td>{a.studentId?.rollNumber}</td>
                  <td style={{ cursor: 'pointer', color: 'var(--primary-600)' }} onClick={() => navigate(`/students/${a.studentId?._id}`)}>{a.studentId?.fullName}</td>
                  <td><span className={`badge ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>{a.status}</span></td>
                  <td>{a.correctionHistory?.length > 0 && <span className="badge badge-warning">{a.correctionHistory.length} correction(s)</span>}</td>
                  {isCoordinator && session.status !== 'draft' && (
                    <td><button className="btn btn-ghost btn-sm" onClick={() => openCorrection(a)}><Edit size={14} /> Correct</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCorrection} onClose={() => setShowCorrection(false)} title="Correct Attendance"
        footer={<>
          <button className="btn btn-outline" onClick={() => setShowCorrection(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCorrection} disabled={correcting}>{correcting ? 'Saving...' : 'Save Correction'}</button>
        </>}>
        {selectedRecord && (
          <>
            <p><strong>{selectedRecord.studentId?.fullName}</strong> ({selectedRecord.studentId?.rollNumber})</p>
            <div style={{ margin: '16px 0', padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.875rem' }}>
                Current: <span className={`badge ${selectedRecord.status === 'present' ? 'badge-success' : 'badge-danger'}`}>{selectedRecord.status}</span>
                &nbsp;→&nbsp;
                New: <span className={`badge ${selectedRecord.status === 'present' ? 'badge-danger' : 'badge-success'}`}>{selectedRecord.status === 'present' ? 'absent' : 'present'}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for correction *</label>
              <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this correction is needed (min 5 characters)" />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SessionDetail;
