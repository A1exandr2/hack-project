import { useEffect, useRef } from 'react';
import './YandexMap.css';

export default function YandexMap({ places, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!window.ymaps) {
      console.error('Yandex Maps API не загружен');
      return;
    }

    const init = async () => {
      // Уничтожаем предыдущую карту, если она существует
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }

      // Создаём карту, центрируем на Нижнем Новгороде
      const map = new window.ymaps.Map(mapRef.current, {
        center: [56.3268, 44.0060],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstanceRef.current = map;

      // Фильтруем места с координатами
      const validPlaces = places.filter(p => p.coordinates);
      if (validPlaces.length === 0) return;

      // Преобразуем координаты: "56.3285,44.0012" → [56.3285, 44.0012]
      const coords = validPlaces.map(p => {
        const [lat, lon] = p.coordinates.split(',').map(Number);
        return [lat, lon];
      });

      // Добавляем маркеры с нумерацией
      const placemarks = [];
      coords.forEach(([lat, lon], idx) => {
        const place = validPlaces[idx];
        const placemark = new window.ymaps.Placemark(
          [lat, lon],
          {
            balloonContent: `
              <div style="padding: 8px; max-width: 300px;">
                <strong style="font-size: 16px; color: #3182ce;">${idx + 1}. ${place.title}</strong><br>
                <div style="margin: 8px 0; color: #666;">${place.address || 'Адрес не указан'}</div>
                ${place.why ? `<div style="font-style: italic; color: #888; margin-top: 8px;">${place.why}</div>` : ''}
              </div>
            `,
            iconCaption: `${idx + 1}`
          },
          {
            preset: 'islands#violetIcon',
            iconColor: '#3182ce'
          }
        );
        map.geoObjects.add(placemark);
        placemarks.push(placemark);
      });

      // Строим маршрут между точками
      if (coords.length > 1) {
        try {
          // Создаем многослойную линию для маршрута
          const route = new window.ymaps.Polyline(
            coords,
            {},
            {
              strokeColor: '#3182ce',
              strokeWidth: 4,
              strokeOpacity: 0.7
            }
          );

          // Добавляем маршрут на карту
          map.geoObjects.add(route);

          // Добавляем стрелки направления на маршрут
          coords.slice(0, -1).forEach((coord, index) => {
            const nextCoord = coords[index + 1];
            const midPoint = [
              (coord[0] + nextCoord[0]) / 2,
              (coord[1] + nextCoord[1]) / 2
            ];

            const directionPlacemark = new window.ymaps.Placemark(
              midPoint,
              {
                iconContent: '→'
              },
              {
                preset: 'islands#blueStretchyIcon',
                iconColor: '#3182ce'
              }
            );
            map.geoObjects.add(directionPlacemark);
          });

        } catch (error) {
          console.error('Ошибка при построении маршрута:', error);
        }
      }

      // Авто-масштабирование под все точки с учетом маршрута
      const bounds = window.ymaps.util.bounds.fromPoints(coords);
      map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 80 });
    };

    window.ymaps.ready(init);

    // Очистка при размонтировании
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [places]);

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h2>Ваш маршрут на карте</h2>
          <button className="map-close-btn" onClick={onClose}>×</button>
        </div>
        <div ref={mapRef} className="yandex-map-container"></div>
        <div className="map-footer-notice">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Карта: © Яндекс</span>
            {places.length > 1 && (
              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                Маршрут через {places.length} точек
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}