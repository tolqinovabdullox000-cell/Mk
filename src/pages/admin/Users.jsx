import { useCallback, useState } from 'react';
import BulkTeachers from '../../components/BulkTeachers';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ErrorNotice from '../../components/ui/ErrorNotice';
import Modal from '../../components/ui/Modal';
import { useAsync } from '../../hooks/useAsync';
import { useI18n } from '../../i18n/useI18n';
import { toAppError } from '../../lib/api/client';
import { createTeacher, deleteTeacher, listTeachers } from '../../lib/api/teachers';
import { SUBJECT_CODES } from '../../lib/constants';
import { normalizePhone } from '../../lib/phone';

const EMPTY_FORM = { full_name: '', phone: '', subjects: [] };

export default function Users() {
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const loadTeachers = useCallback(() => listTeachers(), []);
  const { data, error: loadError, loading, reload } = useAsync(loadTeachers);
  const teachers = data ?? [];

  const toggleSubject = (subject) => {
    setForm((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject],
    }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const saveTeacher = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim() || form.subjects.length === 0) {
      setFormError(t('teachers.required'));
      return;
    }
    const phone = form.phone.trim() ? normalizePhone(form.phone) : '';
    if (phone === null) {
      setFormError(t('teachers.invalidPhone'));
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await createTeacher({
        full_name: form.full_name.trim(),
        phone,
        subjects: form.subjects,
      });
      closeModal();
      reload();
    } catch (cause) {
      setFormError(t(toAppError(cause)));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setPageError('');
    try {
      await deleteTeacher(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (cause) {
      setPageError(t(toAppError(cause)));
      setDeleteTarget(null);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('dashboard.admin')}</p>
          <h1>{t('teachers.title')}</h1>
          <p className="muted">{t('teachers.description')}</p>
        </div>
        <div className="page-heading-actions">
          <button className="btn btn-outline" type="button" onClick={() => setBulkOpen(true)}>{t('teachers.import')}</button>
          <button className="btn btn-primary" type="button" onClick={() => { setFormError(''); setModalOpen(true); }}>
            <span aria-hidden="true">＋</span> {t('teachers.add')}
          </button>
        </div>
      </div>

      <ErrorNotice>{pageError || (loadError && t(toAppError(loadError)))}</ErrorNotice>

      <div className="card table-wrap admin-table">
        {loading ? <p className="muted">{t('common.loading')}</p> : teachers.length === 0 ? (
          <p className="muted">{t('teachers.noTeachers')}</p>
        ) : (
          <table>
            <thead>
              <tr><th>{t('teachers.number')}</th><th>{t('teachers.name')}</th><th>{t('teachers.phone')}</th><th>{t('teachers.subjects')}</th><th>{t('teachers.action')}</th></tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id}>
                  <td>{index + 1}</td>
                  <td className="strong-cell">{teacher.full_name}</td>
                  <td>{teacher.phone || '—'}</td>
                  <td><div className="subject-list">{(teacher.subjects ?? []).map((code) => <span className="subject-chip" key={code}>{t(`subjects.${code}`)}</span>)}</div></td>
                  <td><button className="btn btn-danger" type="button" onClick={() => setDeleteTarget(teacher)}>{t('common.delete')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={t('teachers.add')} dirty={Boolean(form.full_name || form.phone || form.subjects.length)}>
        <form onSubmit={saveTeacher}>
          <label htmlFor="teacher-name">{t('teachers.name')}</label>
          <input id="teacher-name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
          <label htmlFor="teacher-phone">{t('teachers.phone')}</label>
          <input id="teacher-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <fieldset className="subject-fieldset">
            <legend>{t('teachers.subjects')} <span className="muted">({t('teachers.minSubject')})</span></legend>
            <div className="chip-list">
              {SUBJECT_CODES.map((code) => (
                <button
                  className={`chip-button ${form.subjects.includes(code) ? 'selected' : ''}`}
                  type="button"
                  key={code}
                  aria-pressed={form.subjects.includes(code)}
                  onClick={() => toggleSubject(code)}
                >
                  {t(`subjects.${code}`)}
                </button>
              ))}
            </div>
          </fieldset>
          {formError && <div className="error" role="alert">{formError}</div>}
          <div className="modal-actions">
            <button className="btn btn-outline" type="button" onClick={closeModal}>{t('common.cancel')}</button>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
          </div>
        </form>
      </Modal>

      {bulkOpen && (
        <BulkTeachers
          teachers={teachers}
          onClose={() => setBulkOpen(false)}
          onDone={reload}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('teachers.removeTitle')}
        message={t('teachers.removeConfirm', { name: deleteTarget?.full_name ?? '' })}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
