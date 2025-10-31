export default function TimelineView({ timeline }) {
  return (
    <div className="glass-card">
      <h2>Таймлайн прогулки</h2>
      {timeline.map((item) => (
        <div key={item.order} className="timeline-item">
          <h4>{item.order}. {item.place}</h4>
          <p>🚶 До точки: {item.walking_from_prev_min} мин</p>
          <p>⏳ Осмотр: {item.visit_duration_min} мин</p>
          <p><em>{item.why}</em></p>
        </div>
      ))}
    </div>
  );
}