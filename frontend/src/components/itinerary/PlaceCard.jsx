export default function PlaceCard({ place }) {
  const cleanDesc = place.description?.replace(/<[^>]*>/g, '') || '';

  return (
    <div className="place-card">
      <h3>{place.title}</h3>
      <p><em>Почему здесь?</em> {place.why}</p>
      {place.address && <p><strong>Адрес:</strong> {place.address}</p>}
      {cleanDesc && <p>{cleanDesc}</p>}
      {place.url && (
        <p><a href={place.url} target="_blank" rel="noopener noreferrer">Подробнее</a></p>
      )}
    </div>
  );
}