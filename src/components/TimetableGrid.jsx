const DAYS = [
  { value: 1, label: 'Dushanba' },
  { value: 2, label: 'Seshanba' },
  { value: 3, label: 'Chorshanba' },
  { value: 4, label: 'Payshanba' },
  { value: 5, label: 'Juma' },
  { value: 6, label: 'Shanba' },
];

export { DAYS };

const TODAY = (new Date().getDay() + 6) % 7 + 1;

export default function TimetableGrid({ lessons, classId, readOnly = false, onDelete, highlightToday = false }) {
  const rows = Array.from({ length: 9 }, (_, index) => index + 1);
  const selectedLessons = lessons.filter((lesson) => lesson.class_id === classId);

  return (
    <div className="timetable-scroll">
      <table className="timetable-grid">
        <thead>
          <tr>
            <th className="period-heading">Dars</th>
            {DAYS.map((day) => (
              <th className={highlightToday && day.value === TODAY ? 'today-column' : ''} key={day.value}>
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((lessonNo) => (
            <tr key={lessonNo}>
              <th className="period-number">{lessonNo}-dars</th>
              {DAYS.map((day) => {
                const lesson = selectedLessons.find((item) => item.weekday === day.value && item.lesson_no === lessonNo);
                const isToday = highlightToday && day.value === TODAY;
                return (
                  <td className={isToday ? 'today-column' : ''} key={day.value}>
                    {lesson ? (
                      <div className="timetable-lesson">
                        <strong>{lesson.subject}</strong>
                        <span>{lesson.teachers?.full_name ?? 'Ustoz ko‘rsatilmagan'}</span>
                        {lesson.room && <small>{lesson.room}-xona</small>}
                        {!readOnly && (
                          <button className="lesson-remove" type="button" onClick={() => onDelete(lesson)} aria-label={`${lesson.subject} darsini o'chirish`}>×</button>
                        )}
                      </div>
                    ) : <span className="empty-slot">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
