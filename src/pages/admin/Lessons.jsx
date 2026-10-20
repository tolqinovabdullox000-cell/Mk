import { useState } from 'react';
import { get, useStorage } from '../../lib/storage';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

const EMPTY = { subject: '', className: '', room: '', day: '0', start: '08:30', end: '09:15' };

export default function Lessons() {
  // Ustozlar ro'yxati: foydalanuvchilar ichidan faqat teacher rolidagilar
  const teachers = get('users', []).filter((u) => u.role === 'teacher');

  const [lessons, setLessons] = useStorage('lessons', []);
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? '');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();

    if (!teacherId || !form.subject.trim() || !form.className.trim() || !form.room.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    if (form.end <= form.start) {
      setError("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
      return;
    }

    const day = Number(form.day);
    const tId = Number(teacherId);
    const room = form.room.trim();

    // To'qnashuv: bir vaqtda bitta ustoz yoki bitta xona ikki darsda bo'lmasligi kerak
    const clash = lessons.find(
      (l) =>
        l.day === day &&
        l.start < form.end &&
        form.start < l.end &&
        (l.teacherId === tId || l.room.toLowerCase() === room.toLowerCase())
    );
    if (clash) {
      setError(`Bu vaqtda ustoz yoki xona band (${clash.start}-${clash.end}, ${clash.className}, ${clash.room})`);
      return;
    }

    setLessons([
      ...lessons,
      {
        id: Date.now(),
        teacherId: tId,
        subject: form.subject.trim(),
        className: form.className.trim(),
        room,
        day,
        start: form.start,
        end: form.end,
      },
    ]);
    setForm({ ...EMPTY, day: form.day });
    setError('');
  };

  const remove = (id) => {
    if (window.confirm("Bu darsni o'chirasizmi?")) {
      setLessons(lessons.filter((l) => l.id !== id));
    }
  };

  const teacherName = (id) => teachers.find((t) => t.id === id)?.name ?? "Noma'lum";

  const sorted = [...lessons].sort(
    (a, b) => a.day - b.day || a.start.localeCompare(b.start)
  );

  return (
    <div>
      <h2>Dars biriktirish</h2>

      <form className="card" onSubmit={submit}>
        <div className="form-grid">
          <div>
            <label>Ustoz</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Fan (darslik)</label>
            <input name="subject" value={form.subject} onChange={change} placeholder="Matematika" />
          </div>
          <div>
            <label>Sinf</label>
            <input name="className" value={form.className} onChange={change} placeholder="7-A" />
          </div>
          <div>
            <label>Xona</label>
            <input name="room" value={form.room} onChange={change} placeholder="12-xona" />
          </div>
          <div>
            <label>Hafta kuni</label>
            <select name="day" value={form.day} onChange={change}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Boshlanishi</label>
            <input type="time" name="start" value={form.start} onChange={change} />
          </div>
          <div>
            <label>Tugashi</label>
            <input type="time" name="end" value={form.end} onChange={change} />
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" type="submit" style={{ marginTop: 14 }}>
          Qo'shish
        </button>
      </form>

      <div className="card table-wrap" style={{ marginTop: 16 }}>
        {sorted.length === 0 ? (
          <p className="muted">Hali dars biriktirilmagan.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ustoz</th><th>Kun</th><th>Vaqt</th><th>Fan</th><th>Sinf</th><th>Xona</th><th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((l) => (
                <tr key={l.id}>
                  <td>{teacherName(l.teacherId)}</td>
                  <td>{DAYS[l.day]}</td>
                  <td>{l.start}-{l.end}</td>
                  <td>{l.subject}</td>
                  <td>{l.className}</td>
                  <td>{l.room}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => remove(l.id)}>O'chirish</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
