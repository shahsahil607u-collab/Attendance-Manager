import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import { Search, Plus, Edit, UserX, UserCheck, Eye } from 'lucide-react';
import { getErrorMessage } from '../utils/helpers';

const Students = () => {
  const { isCoordinator } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', rollNumber: '', email: '', phone: '', department: 'Computer Science', semester: '', year: '', team: 'Technical Team' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStudents(); }, [page, search, showInactive]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students', { params: { page, limit: 15, search, isActive: showInactive ? undefined : true, sortBy: 'rollNumber', sortOrder: 'asc' } });
      setStudents(res.data.data.students);
      setPagination(res.data.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openAddForm = () => {
    setEditStudent(null);
    setFormData({ fullName: '', rollNumber: '', email: '', phone: '', department: 'Computer Science', semester: '', year: '', team: 'Technical Team' });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (student) => {
    setEditStudent(student);
    setFormData({ fullName: student.fullName, rollNumber: student.rollNumber, email: student.email, phone: student.phone, department: student.department || '', semester: student.semester || '', year: student.year || '', team: student.team || '' });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.fullName || !formData.rollNumber || !formData.email || !formData.phone) {
      setFormError('Please fill in all required fields.'); return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, semester: formData.semester ? Number(formData.semester) : undefined, year: formData.year ? Number(formData.year) : undefined };

      if (editStudent) {
        // Exclude rollNumber from update payload — it's disabled in the form
        // and sending it can cause duplicate-key crashes on the backend
        const { rollNumber, ...updatePayload } = payload;
        await api.put(`/students/${editStudent._id}`, updatePayload);
      } else {
        await api.post('/students', payload);
      }
      setShowForm(false);
      fetchStudents();
    } catch (err) { setFormError(getErrorMessage(err)); } finally { setSaving(false); }
  };

  const toggleActive = async (student) => {
    if (!window.confirm(`${student.isActive ? 'Deactivate' : 'Reactivate'} ${student.fullName}?`)) return;
    try {
      await api.patch(`/students/${student._id}/deactivate`);
      fetchStudents();
    } catch (err) { alert(getErrorMessage(err)); }
  };

  // Calculate the serial number offset based on the current page
  const serialOffset = ((pagination.page || 1) - 1) * (pagination.limit || 15);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h1>Students</h1><p>Manage technical team members</p></div>
          {isCoordinator && <button className="btn btn-primary" onClick={openAddForm}><Plus size={18} /> Add Student</button>}
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input">
          <Search size={16} className="search-icon" />
          <input className="form-input" placeholder="Search by name or roll number..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showInactive} onChange={e => { setShowInactive(e.target.checked); setPage(1); }} /> Show inactive
        </label>
      </div>

      {loading ? <LoadingSpinner /> : students.length === 0 ? (
        <EmptyState title="No students found" message={search ? 'Try a different search term.' : 'Add your first student to get started.'} />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>Year</th>
                  <th>Team</th>
                  <th>Status</th>
                  {isCoordinator && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {students.map((s, index) => (
                  <tr key={s._id}>
                    <td style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>{serialOffset + index + 1}</td>
                    <td><strong>{s.rollNumber}</strong></td>
                    <td style={{ cursor: 'pointer', color: 'var(--primary-600)', fontWeight: 500 }} onClick={() => navigate(`/students/${s._id}`)}>{s.fullName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.email}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.phone}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.department}</td>
                    <td style={{ fontSize: '0.8125rem', textAlign: 'center' }}>{s.semester || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', textAlign: 'center' }}>{s.year || '—'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{s.team || '—'}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    {isCoordinator && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => navigate(`/students/${s._id}`)}><Eye size={16} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEditForm(s)}><Edit size={16} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" title={s.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(s)}>
                            {s.isActive ? <UserX size={16} color="var(--danger-500)" /> : <UserCheck size={16} color="var(--success-500)" />}
                          </button>
                        </div>
                      </td>
                    )}
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editStudent ? 'Edit Student' : 'Add Student'}
        footer={<>
          <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Student'}</button>
        </>}>
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input className="form-input" value={formData.rollNumber} onChange={e => setFormData({ ...formData, rollNumber: e.target.value })} required disabled={!!editStudent} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <input className="form-input" value={formData.team} onChange={e => setFormData({ ...formData, team: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-select" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                <option value="">Select</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-select" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                <option value="">Select</option>{[1,2,3,4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
