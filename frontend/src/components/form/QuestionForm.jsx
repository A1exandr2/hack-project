import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function QuestionForm({ onPlanReceived }) {
  const [interests, setInterests] = useState('');
  const [time, setTime] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);
  const ymapRef = useRef(null);

  const interestCategories = [
    { id: 1, name: 'памятник', description: 'Памятники и монументы'},
    { id: 10, name: 'мозаика', description: 'Мозаики и художественные работы'},
    { id: 2, name: 'парки', description: 'Парки и зоны прогулки'},
    { id: 5, name: 'архитектура', description: 'Архитектурные достопримечательности'},
    { id: 7, name: 'музеи', description: 'Музеи и выставки'},
    { id: 8, name: 'театры', description: 'Театры и концертные залы'},
    { id: 3, name: 'макеты', description: 'Тактильные макеты'},
    { id: 4, name: 'набережные', description: 'Набережные и виды на воду'},
    { id: 6, name: 'культура', description: 'Библиотеки, кинотеатры, планетарии'},
    { id: 9, name: 'история', description: 'Исторические территории'}
  ];

  useEffect(() => {
    if (!window.ymaps) {
      console.error('Yandex Maps API не загружен');
      return;
    }

    setMapLoaded(true);

    const init = () => {
      if (!mapRef.current) {
        console.error('Map container not found');
        return;
      }

      try {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [56.3268, 44.0060],
          zoom: 13,
          controls: ['zoomControl', 'fullscreenControl']
        });

        map.events.add('click', (e) => {
          const coords = e.get('coords');
          setUserLat(coords[0]);
          setUserLon(coords[1]);

          if (ymapRef.current?.placemark) {
            map.geoObjects.remove(ymapRef.current.placemark);
          }

          const placemark = new window.ymaps.Placemark(
            coords,
            { hintContent: 'Старт маршрута' },
            { preset: 'islands#redDotIcon' }
          );
          map.geoObjects.add(placemark);
          ymapRef.current = { map, placemark };
        });

        ymapRef.current = { map };
        setMapInitialized(true);
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const timer = setTimeout(() => {
      window.ymaps.ready(init);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ymapRef.current?.map) {
        try {
          ymapRef.current.map.destroy();
        } catch (error) {
          console.error('Error destroying map:', error);
        }
      }
      ymapRef.current = null;
    };
  }, []);

  const handleCategoryClick = (categoryName) => {
    const interestsArray = interests
      .split(',')
      .map(item => item.trim())
      .filter(item => item);

    if (interestsArray.includes(categoryName)) {
      setInterests(interestsArray.filter(item => item !== categoryName).join(', '));
    } else {
      setInterests([...interestsArray, categoryName].join(', '));
    }
  };

  const isCategoryActive = (categoryName) => {
    return interests.split(',').map(item => item.trim()).includes(categoryName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userLat || !userLon) {
      alert('Пожалуйста, выберите точку на карте!');
      return;
    }

    if (!interests.trim()) {
      alert('Выберите хотя бы один интерес!');
      return;
    }

    const timeHours = parseFloat(time);
    if (isNaN(timeHours) || timeHours < 0.5 || timeHours > 8) {
      alert('Укажите время от 0.5 до 8 часов.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        interests: interests.trim(),
        time_hours: timeHours,
        user_lat: userLat,
        user_lon: userLon
      };

      console.log('Отправляемые данные:', requestData);

      const response = await axios.post('http://localhost:8000/api/plan', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      });

      console.log('Получен ответ:', response.data);
      onPlanReceived(response.data);
      
    } catch (err) {
      console.error('Ошибка при запросе к бэкенду:', err);
      
      if (err.response) {
        console.error('Статус ошибки:', err.response.status);
        console.error('Данные ошибки:', err.response.data);
        alert(`Ошибка сервера: ${err.response.status} - ${err.response.data?.detail || 'Неизвестная ошибка'}`);
      } else if (err.request) {
        console.error('Не получен ответ от сервера:', err.request);
        alert('Не удалось подключиться к серверу. Проверьте, запущен ли бэкенд на localhost:8000');
      } else {
        console.error('Ошибка настройки запроса:', err.message);
        alert('Ошибка при отправке запроса: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const testWithExampleData = () => {
    setInterests('музеи');
    setTime('8');
    setUserLat(56.324355);
    setUserLon(44.006433);
    
    if (ymapRef.current?.map) {
      const coords = [56.324355, 44.006433];
      
      if (ymapRef.current.placemark) {
        ymapRef.current.map.geoObjects.remove(ymapRef.current.placemark);
      }

      const placemark = new window.ymaps.Placemark(
        coords,
        { hintContent: 'Тестовая точка' },
        { preset: 'islands#redDotIcon' }
      );
      ymapRef.current.map.geoObjects.add(placemark);
      ymapRef.current.placemark = placemark;
      
      ymapRef.current.map.setCenter(coords, 15);
    }
  };

  return (
    <div className="glass-card">
      <h2 className="text-center mb-lg">AI-Помощник туриста</h2>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={testWithExampleData}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-primary)',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Загрузить тестовые данные
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><strong>Выберите ваши интересы:</strong></label>
          <div className="categories-grid">
            {interestCategories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category.name)}
                className={`category-btn ${isCategoryActive(category.name) ? 'active' : ''}`}
                title={category.description}
              >
                <span className="category-emoji">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          <div className="selected-interests">
            <label><strong>Выбранные интересы:</strong></label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Выберите интересы выше или впишите свои..."
              rows="2"
            />
          </div>
        </div>

        <div className="form-group">
          <label><strong>Сколько времени у вас есть? (в часах)</strong></label>
          <input
            type="number"
            min="0.5"
            max="8"
            step="0.25"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="2.5"
            required
          />
          <div className="time-recommendation">
            Рекомендуем 2–4 часа для комфортной прогулки
          </div>
        </div>

        <div className="form-group">
          <label><strong>Выберите точку старта на карте:</strong></label>
          {!mapLoaded ? (
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #444)'
            }}>
              Загрузка Яндекс Карт...
            </div>
          ) : (
            <div
              ref={mapRef}
              style={{
                height: '300px',
                width: '100%',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #444)',
                background: '#f5f5f5'
              }}
            />
          )}
          {userLat && userLon && (
            <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Выбрано: {userLat.toFixed(5)}, {userLon.toFixed(5)}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !mapInitialized}
          className="submit-btn"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Строим маршрут...
            </>
          ) : (
            'Построить маршрут'
          )}
        </button>
      </form>
    </div>
  );
}