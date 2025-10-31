export default function SummaryCard({ summary }) {
  return (
    <div className="glass-card">
      <h2>Итоги маршрута</h2>
      <p>📍 <strong>{summary.total_places}</strong> места</p>
      <p>🚶 Пешком: <strong>{summary.total_walking_time_min.toFixed(1)} мин</strong></p>
      <p>⏱️ Общая длительность: <strong>{summary.total_duration_hours} ч</strong> (из {summary.max_available_hours} ч)</p>
    </div>
  );
}