import './AboutPage.css';

export default function AboutPage({ onClose }) {
  const openTelegram = () => {
    window.open('https://t.me/tourist_assistant_may_bot', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>О сервисе</h1>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="about-content">
        <div className="about-section">
          <h2>Что это за сервис?</h2>
          <p>
            AI-Помощник туриста — это интеллектуальный гид по Нижнему Новгороду, который помогает вам строить идеальные маршруты на основе ваших интересов и доступного времени.
          </p>
        </div>
        <div className="about-section">
          <h2>Как это работает?</h2>
          <ol>
            <li>Выберите ваши интересы: памятники, парки, музеи, театры и другие.</li>
            <li>Укажите, сколько времени у вас есть (от 0.5 до 8 часов).</li>
            <li>Выберите место начала прогулки (например, пл. Минина или Московский вокзал).</li>
            <li>Нажмите «Построить маршрут» — и получите готовый план с картой и таймлайном!</li>
          </ol>
        </div>
        <div className="about-section">
          <h2>Кто мы?</h2>
          <p>
            Мы — команда <strong>«may»</strong>, участники хакатона <strong>GORKYCODE 2025</strong>. Наша цель — сделать городские прогулки умными, персональными и удобными для всех.
          </p>
        </div>
        <div className="about-section">
          <h2>Технологии</h2>
          <p>
            Сервис построен на современных технологиях: React, Node.js, Yandex Maps API и ИИ-алгоритмах для построения оптимальных маршрутов.
          </p>
        </div>
      </div>

      <div className="telegram-container">
        <div className="telegram-button-group">
          <button className="telegram-text-btn">от команды «may»</button>
          <button className="telegram-icon-btn" onClick={openTelegram}>
            <img src="/4886998-middle.png" alt="Telegram" className="telegram-icon" />
          </button>
        </div>
      </div>

      <div className="about-footer">
        <button className="back-btn" onClick={onClose}>
          Назад к построению маршрута
        </button>
      </div>
    </div>
  );
}