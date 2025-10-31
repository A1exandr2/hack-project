import { useState } from 'react';
import axios from 'axios';

export default function QuestionForm({ onPlanReceived }) {
  const [interests, setInterests] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const interestCategories = [
  { id: 1, name: 'памятник', description: 'Памятники и монументы', icon: '🏛️' },
  { id: 10, name: 'мозаика', description: 'Мозаики и художественные работы', icon: '🎨' },
  { id: 2, name: 'парки', description: 'Парки и зоны прогулки', icon: '🌳' },
  { id: 5, name: 'архитектура', description: 'Архитектурные достопримечательности', icon: '🏛️' },
  { id: 7, name: 'музеи', description: 'Музеи и выставки', icon: '🖼️' },
  { id: 8, name: 'театры', description: 'Театры и концертные залы', icon: '🎭' },
  { id: 3, name: 'макеты', description: 'Тактильные макеты', icon: '🔲' },
  { id: 4, name: 'набережные', description: 'Набережные и виды на воду', icon: '🌊' },
  { id: 6, name: 'культура', description: 'Библиотеки, кинотеатры, планетарии', icon: '📚' },
  { id: 9, name: 'история', description: 'Исторические территории', icon: '📜' }
];

  const handleCategoryClick = (categoryName) => {
    const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);
    
    if (interestsArray.includes(categoryName)) {
      const newInterests = interestsArray.filter(item => item !== categoryName).join(', ');
      setInterests(newInterests);
    } else {
      const newInterests = [...interestsArray, categoryName].join(', ');
      setInterests(newInterests);
    }
  };

  const isCategoryActive = (categoryName) => {
    return interests.split(',').map(item => item.trim()).includes(categoryName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/plan', {
        interests,
        time_hours: parseFloat(time),
        location,
      });

      onPlanReceived(response.data);
    } catch (err) {
      console.error('Ошибка при запросе к бэкенду:', err);
      alert('Ошибка генерации маршрута. Проверьте бэкенд.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 className="text-center mb-lg">AI-Помощник туриста</h2>
      
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
                <span className="category-emoji">{category.emoji}</span>
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
              required
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
            Рекомендуем 2-4 часа для комфортной прогулки
          </div>
        </div>

        <div className="form-group">
          <label><strong>Откуда начнём прогулку? (адрес или место)</strong></label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="пл. Минина"
            required
          />
          <div className="location-examples">
            Примеры: пл. Минина, ул. Большая Покровская, Московский вокзал
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
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