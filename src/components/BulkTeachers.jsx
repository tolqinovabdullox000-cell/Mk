import { useState } from 'react';
import { useI18n } from '../i18n/useI18n';
import { toAppError } from '../lib/api/client';
import { bulkInsertTeachers } from '../lib/api/teachers';
import { normalizePhone } from '../lib/phone';
import { subjectCodeFromValue } from '../lib/subjectCodes';
import Modal from './ui/Modal';

function normalizeName(value) {
  return value.normalize('NFC').trim().toLocaleLowerCase('uz');
}

export default function BulkTeachers({ teachers, onClose, onDone }) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function parse() {
    const ok = [];
    const bad = [];
    const names = new Set(teachers.map((teacher) => normalizeName(teacher.full_name)));
    text.split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      const parts = line.split(/\t|;/).map((part) => part.trim());
      const full_name = parts[0];
      const rawPhone = parts[1] ?? '';
      const phone = rawPhone ? normalizePhone(rawPhone) : '';
      const subjects = [...new Set((parts[2] ?? '')
        .split(',')
        .map((value) => subjectCodeFromValue(value))
        .filter(Boolean))];
      const row = index + 1;
      if (!full_name) {
        bad.push(t('bulk.rowName', { n: row }));
      } else if (names.has(normalizeName(full_name))) {
        bad.push(t('bulk.duplicate', { n: row, name: full_name }));
      } else if (rawPhone && phone === null) {
        bad.push(t('bulk.invalidPhone', { n: row, name: full_name }));
      } else if (subjects.length === 0) {
        bad.push(t('bulk.noSubjects', { n: row, name: full_name }));
      } else {
        names.add(normalizeName(full_name));
        ok.push({ full_name, phone, subjects });
      }
    });
    setPreview({ ok, bad });
    setError('');
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      await bulkInsertTeachers(preview.ok);
      onDone();
      onClose();
    } catch (cause) {
      setError(t(toAppError(cause)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={t('bulk.title')} dirty={Boolean(text)}>
      <p>{t('bulk.format')}</p>
      <textarea
        rows={10}
        value={text}
        onChange={(event) => { setText(event.target.value); setPreview(null); }}
        placeholder={t('bulk.placeholder')}
      />
      {!preview && <button className="btn btn-outline" type="button" onClick={parse} disabled={!text.trim()}>{t('bulk.validate')}</button>}
      {preview && (
        <>
          <p>{t('bulk.addCount', { n: preview.ok.length })}</p>
          {preview.bad.length > 0 && (
            <div className="error" role="alert">{preview.bad.map((message, index) => <div key={`${index}-${message}`}>{message}</div>)}</div>
          )}
          {preview.ok.length > 0 && (
            <button className="btn btn-primary" type="button" onClick={save} disabled={busy}>
              {busy ? t('common.saving') : t('bulk.saveCount', { n: preview.ok.length })}
            </button>
          )}
        </>
      )}
      {error && <div className="error" role="alert">{error}</div>}
      <div className="modal-actions"><button className="btn btn-outline" type="button" onClick={onClose}>{t('common.close')}</button></div>
    </Modal>
  );
}
