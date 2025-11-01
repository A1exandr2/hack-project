import { useState } from 'react';
import YandexMap from '../map/YandexMap';

export default function ItineraryDisplay({ planData, onNewRoute }) {
  const plan = Array.isArray(planData?.plan) ? planData.plan : [];
  const summary = planData?.summary || {};
  const [currentView, setCurrentView] = useState('timeline');
  const [showMap, setShowMap] = useState(false);

  const LocationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon-wrapper">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
    </svg>
  );
  const TimeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon-wrapper">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
    </svg>
  );
  const WalkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon-wrapper">
      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
    </svg>
  );

  if (plan.length === 0) {
    return (
      <div className="glass-card text-center">
        <h2>Маршрут не найден</h2>
        <p>Попробуйте выбрать центр города или изменить интересы.</p>
        <button onClick={onNewRoute} style={{ marginTop: '16px' }}>
          Назад к форме
        </button>
      </div>
    );
  }

  const placesForMap = plan.map(place => ({
    ...place,
    coordinates: (place.lat != null && place.lon != null) 
      ? `${place.lat},${place.lon}` 
      : null
  })).filter(place => place.coordinates);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button
        onClick={onNewRoute}
        className="back-button"
        style={{
          background: 'var(--accent-gradient)',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          width: 'fit-content',
          alignSelf: 'flex-start',
          marginBottom: '16px',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'all var(--transition-normal)'
        }}
      >
        ← Назад к построению маршрута
      </button>

      <div className="glass-card">
        <h2>Ваш маршрут готов!</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <LocationIcon />
            <div style={{ fontWeight: '600', marginTop: '8px' }}>
              {summary.total_places || 0} мест
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <TimeIcon />
            <div style={{ fontWeight: '600', marginTop: '8px' }}>
              {(summary.total_duration_hours || 0).toFixed(1)} ч
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <WalkIcon />
            <div style={{ fontWeight: '600', marginTop: '8px' }}>
              {Math.round(summary.total_walking_time_min || 0)} мин
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '4px',
          }}
        >
          <button
            onClick={() => setCurrentView('timeline')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: currentView === 'timeline' ? 'var(--accent-primary)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: currentView === 'timeline' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500',
            }}
          >
            Таймлайн
          </button>
          <button
            onClick={() => setCurrentView('places')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: currentView === 'places' ? 'var(--accent-primary)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: currentView === 'places' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500',
            }}
          >
            Места
          </button>
        </div>
      </div>

      {currentView === 'timeline' ? (
        <div className="glass-card">
          <h2>Таймлайн прогулки</h2>
          {plan.map((item, idx) => (
            <div
              key={idx}
              className="timeline-step"
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <strong style={{ minWidth: '24px', fontSize: '1.2rem' }}>{idx + 1}</strong>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <WalkIcon /> {item.walking_time_min || 0} мин до точки
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TimeIcon /> {item.visit_duration_min || 0} мин осмотр
                  </span>
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                  }}
                >
                  {item.why || 'Описание недоступно'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card">
          <h2>Места маршрута</h2>
          {plan.map((item, idx) => (
            <div key={idx} className="place-item" style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  {idx + 1}
                </span>
                {item.title}
              </h3>
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '16px',
                  borderRadius: '12px',
                  borderLeft: '3px solid var(--accent-primary)',
                }}
              >
                <strong>Почему здесь?</strong> {item.why || 'Интересное место по вашим предпочтениям.'}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowMap(true)}
        style={{
          marginTop: '12px',
          padding: '12px 24px',
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.3s ease',
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        disabled={placesForMap.length === 0}
      >
        Показать на карте {placesForMap.length > 0 ? `(${placesForMap.length})` : '(координаты отсутствуют)'}
      </button>

      {showMap && placesForMap.length > 0 && (
        <YandexMap
          places={placesForMap}
          onClose={() => setShowMap(false)}
        />
      )}

      <button
        onClick={onNewRoute}
        style={{
          width: '100%',
          padding: '18px',
          marginTop: '16px',
          fontSize: '1.1rem',
          fontWeight: '600',
        }}
      >
        Построить новый маршрут
      </button>
    </div>
  );
}