import { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import { getErrorMessage } from '../../utils/helpers';
import api from '../../services/api';

const EditSessionModal = ({ isOpen, onClose, session, onSuccess }) => {
  const [form, setForm] = useState({
    date: '',
    sessionName: '',
    topic: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Populate form when session changes or modal opens
  useEffect(() => {
    if (session && isOpen) {
      setForm({
        date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
        sessionName: session.sessionName || '',
        topic: session.topic || '',
        startTime: session.startTime || '',
        endTime: session.endTime || '',
        description: session.description || '',
      });
      setError('');
      setFieldErrors({});
    }
  }, [session, isOpen]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!form.date) errors.date = 'Date is required.';
    if (!form.sessionName.trim()) errors.sessionName = 'Session name is required.';
    if (!form.topic.trim()) errors.topic = 'Topic is required.';
    if (!form.startTime) errors.startTime = 'Start time is required.';
    if (!form.endTime) errors.endTime = 'End time is required.';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = 'End time must be after start time.';
    }
    if (form.sessionName.length > 200) errors.sessionName = 'Session name cannot exceed 200 characters.';
    if (form.topic.length > 200) errors.topic = 'Topic cannot exceed 200 characters.';
    if (form.description && form.description.length > 1000) errors.description = 'Description cannot exceed 1000 characters.';
    return errors;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setError('');
    setSaving(true);
    try {
      await api.put(`/sessions/${session._id}`, form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !saving) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!session) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? undefined : onClose}
      title="Edit Session"
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-session-form"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <form id="edit-session-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className={`form-input${fieldErrors.date ? ' error' : ''}`}
              value={form.date}
              onChange={e => handleChange('date', e.target.value)}
              required
            />
            {fieldErrors.date && <span className="form-error">{fieldErrors.date}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Session Name *</label>
            <input
              className={`form-input${fieldErrors.sessionName ? ' error' : ''}`}
              value={form.sessionName}
              onChange={e => handleChange('sessionName', e.target.value)}
              maxLength={200}
              required
            />
            {fieldErrors.sessionName && <span className="form-error">{fieldErrors.sessionName}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time *</label>
            <input
              type="time"
              className={`form-input${fieldErrors.startTime ? ' error' : ''}`}
              value={form.startTime}
              onChange={e => handleChange('startTime', e.target.value)}
              required
            />
            {fieldErrors.startTime && <span className="form-error">{fieldErrors.startTime}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">End Time *</label>
            <input
              type="time"
              className={`form-input${fieldErrors.endTime ? ' error' : ''}`}
              value={form.endTime}
              onChange={e => handleChange('endTime', e.target.value)}
              required
            />
            {fieldErrors.endTime && <span className="form-error">{fieldErrors.endTime}</span>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Topic *</label>
          <input
            className={`form-input${fieldErrors.topic ? ' error' : ''}`}
            value={form.topic}
            onChange={e => handleChange('topic', e.target.value)}
            maxLength={200}
            required
          />
          {fieldErrors.topic && <span className="form-error">{fieldErrors.topic}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className={`form-textarea${fieldErrors.description ? ' error' : ''}`}
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Optional description"
            maxLength={1000}
          />
          {fieldErrors.description && <span className="form-error">{fieldErrors.description}</span>}
        </div>
      </form>
    </Modal>
  );
};

export default EditSessionModal;
