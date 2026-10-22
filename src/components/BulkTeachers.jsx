import { useState } from "react";
import { supabase } from "../lib/supabase";

// Fan nomlari ro'yxati (Users.jsx dagi bilan bir xil bo'lsin)
const SUBJECTS = [
  "Ona tili", "Adabiyot", "Matematika", "Algebra", "Geometriya", "Fizika",
  "Kimyo", "Biologiya", "Tarix", "Geografiya", "Ingliz tili", "Rus tili",
  "Informatika", "Jismoniy tarbiya", "Texnologiya", "Tasviriy san'at",
  "Musiqa", "Boshlang'ich sinf",
];
const norm = (s) => s.toLowerCase().replace(/[’`‘]/g, "'").trim();

export default function BulkTeachers({ onClose, onDone }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function parse() {
    const ok = [];
    const bad = [];
    text.split("\n").forEach((line, i) => {
      if (!line.trim()) return;
      const parts = line.split(/\t|;/).map((p) => p.trim());
      const full_name = parts[0];
      const phone = parts[1] || null;
      const subjects = [];
      const unknown = [];
      (parts[2] || "").split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => {
        const found = SUBJECTS.find((x) => norm(x) === norm(s));
        if (found) subjects.push(found);
        else unknown.push(s);
      });
      if (!full_name) bad.push(`${i + 1}-qator: ism yo'q`);
      else if (subjects.length === 0) bad.push(`${i + 1}-qator (${full_name}): fan topilmadi ${unknown.join(", ")}`);
      else {
        if (unknown.length) bad.push(`${i + 1}-qator (${full_name}): noma'lum fan o'tkazib yuborildi: ${unknown.join(", ")}`);
        ok.push({ full_name, phone, subjects });
      }
    });
    setPreview({ ok, bad });
    setMsg("");
  }

  async function save() {
    if (!supabase) {
      setMsg("Supabase sozlanmagan. .env faylini tekshiring.");
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const { error } = await supabase.from("teachers").insert(preview.ok);
      if (error) {
        setMsg("Xatolik: " + error.message);
        return;
      }
      onDone();
      onClose();
    } catch (error) {
      setMsg("Xatolik: " + error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Ustozlarni ommaviy qo'shish</h3>
        <p>Har qatorda: <b>Ism ; telefon ; fan1, fan2</b> (Excel'dan nusxalab ham bo'ladi)</p>
        <textarea rows={10} value={text} onChange={(e) => { setText(e.target.value); setPreview(null); }}
          placeholder="Karimov Akmal ; 901234567 ; Matematika, Algebra" />
        {!preview && <button type="button" onClick={parse} disabled={!text.trim()}>Tekshirish</button>}
        {preview && (
          <>
            <p><b>{preview.ok.length}</b> ta ustoz qo'shiladi.</p>
            {preview.bad.length > 0 && (
              <div className="error">{preview.bad.map((b) => <div key={b}>{b}</div>)}</div>
            )}
            {preview.ok.length > 0 && (
              <button type="button" onClick={save} disabled={busy}>
                {busy ? "Saqlanmoqda..." : `${preview.ok.length} ta ustozni saqlash`}
              </button>
            )}
          </>
        )}
        {msg && <p className="error">{msg}</p>}
        <button type="button" onClick={onClose}>Yopish</button>
      </div>
    </div>
  );
}
