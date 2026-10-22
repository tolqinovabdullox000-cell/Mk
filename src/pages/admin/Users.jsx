import { useEffect, useState } from 'react';
import BulkTeachers from '../../components/BulkTeachers';
import { supabase } from '../../lib/supabase';

const SUBJECTS = [
  'Ona tili', 'Adabiyot', 'Matematika', 'Algebra', 'Geometriya', 'Fizika',
  'Kimyo', 'Biologiya', 'Tarix', 'Geografiya', 'Ingliz tili', 'Rus tili',
  'Informatika', 'Jismoniy tarbiya', 'Texnologiya', "Tasviriy san'at",
  'Musiqa', 'Boshlang‘ich sinf',
];

const EMPTY_FORM = { full_name: '', phone: '', subjects: [] };

export default function Users() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const reloadTeachers = () => setRefresh((value) => value + 1);

  useEffect(() => {
    let active = true;

    async function loadTeachers() {
      setLoading(true);
      setError('');
      if (!supabase) {
        setError('Supabase sozlanmagan. .env faylini tekshiring.');
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('teachers')
        .select('id, full_name, phone, subjects')
        .order('full_name');

      if (!active) return;
      if (queryError) setError(`Ustozlarni yuklashda xatolik: ${queryError.message}`);
      else setTeachers(data ?? []);
      setLoading(false);
    }

    loadTeachers().catch((loadError) => {
      if (!active) return;
      setError(`Ustozlarni yuklashda xatolik: ${loadError.message}`);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [refresh]);

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
    setError('');
  };

  const saveTeacher = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim() || form.subjects.length === 0) {
      setError("Ustozning F.I.Sh. va kamida bitta fanini kiriting.");
      return;
    }
    if (!supabase) {
      setError('Supabase sozlanmagan. .env faylini tekshiring.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('teachers').insert({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        subjects: form.subjects,
      });
      if (insertError) {
        setError(`Ustozni saqlashda xatolik: ${insertError.message}`);
        return;
      }
      closeModal();
      setRefresh((value) => value + 1);
    } catch (insertError) {
      setError(`Ustozni saqlashda xatolik: ${insertError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const removeTeacher = async (teacher) => {
    if (!window.confirm(`${teacher.full_name} ustozni o'chirasizmi? Uning darslari ham o'chadi.`)) return;
    if (!supabase) {
      setError('Supabase sozlanmagan. .env faylini tekshiring.');
      return;
    }

    setError('');
    try {
      const { error: deleteError } = await supabase.from('teachers').delete().eq('id', teacher.id);
      if (deleteError) {
        setError(`Ustozni o'chirishda xatolik: ${deleteError.message}`);
        return;
      }
      setRefresh((value) => value + 1);
    } catch (deleteError) {
      setError(`Ustozni o'chirishda xatolik: ${deleteError.message}`);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMIN PANEL</p>
          <h1>Foydalanuvchilar</h1>
          <p className="muted">Ustozlar ro'yxati va fanlarini boshqaring.</p>
        </div>
        <div className="page-heading-actions">
          <button className="btn btn-outline" type="button" onClick={() => setBulkOpen(true)}>
            Ro'yxatdan yuklash
          </button>
          <button className="btn btn-primary" type="button" onClick={() => { setError(''); setModalOpen(true); }}>
            <span aria-hidden="true">＋</span> Ustoz qo'shish
          </button>
        </div>
      </div>

      {error && <div className="error notice" role="alert">{error}</div>}

      <div className="card table-wrap admin-table">
        {loading ? <p className="muted">Yuklanmoqda...</p> : teachers.length === 0 ? (
          <p className="muted">Hozircha ustozlar qo'shilmagan.</p>
        ) : (
          <table>
            <thead>
              <tr><th>№</th><th>F.I.Sh</th><th>Telefon</th><th>Fanlari</th><th>Amal</th></tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id}>
                  <td>{index + 1}</td>
                  <td className="strong-cell">{teacher.full_name}</td>
                  <td>{teacher.phone || '—'}</td>
                  <td><div className="subject-list">{(teacher.subjects ?? []).map((subject) => <span className="subject-chip" key={subject}>{subject}</span>)}</div></td>
                  <td><button className="btn btn-danger" type="button" onClick={() => removeTeacher(teacher)}>O'chirish</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <form className="modal-card" onSubmit={saveTeacher} aria-labelledby="teacher-modal-title">
            <div className="modal-heading">
              <div><p className="eyebrow">YANGI FOYDALANUVCHI</p><h2 id="teacher-modal-title">Ustoz qo'shish</h2></div>
              <button className="icon-btn" type="button" onClick={closeModal} aria-label="Yopish">×</button>
            </div>
            <label htmlFor="teacher-name">F.I.Sh</label>
            <input id="teacher-name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
            <label htmlFor="teacher-phone">Telefon</label>
            <input id="teacher-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <fieldset className="subject-fieldset">
              <legend>Fanlar <span className="muted">(kamida bittasini tanlang)</span></legend>
              <div className="chip-list">
                {SUBJECTS.map((subject) => (
                  <button
                    className={`chip-button ${form.subjects.includes(subject) ? 'selected' : ''}`}
                    type="button"
                    key={subject}
                    aria-pressed={form.subjects.includes(subject)}
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </fieldset>
            {error && <div className="error" role="alert">{error}</div>}
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={closeModal}>Bekor qilish</button>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            </div>
          </form>
        </div>
      )}
      {bulkOpen && (
        <BulkTeachers
          onClose={() => setBulkOpen(false)}
          onDone={reloadTeachers}
        />
      )}
    </section>
  );
}
