import './WelcomeScreen.css';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      {/* Улучшенный фон */}
      <div className="enhanced-background">
        <div className="bg-gradients">
          <div className="gradient-1"></div>
          <div className="gradient-2"></div>
          <div className="gradient-3"></div>
        </div>
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      {/* Главная карточка */}
      <div className="welcome-card">
        {/* Котик */}
        <div className="cat-hero">
          <div className="cat-orb">
            <img 
              src="/free-icon-cat-5541844.png" 
              alt="Котик-помощник" 
              className="magic-cat"
            />
            <div className="cat-glow"></div>
          </div>
        </div>

        {/* Контент */}
        <div className="welcome-content">
          <h1 className="brand-title">
            AI-ГИД
          </h1>
          <p className="brand-subtitle">
            Ваш персональный гид по городу
          </p>

          <div className="feature-highlight">
            <span>Умные маршруты</span>
            <span>•</span>
            <span>Персональные рекомендации</span>
          </div>

          <button 
            className="cta-button"
            onClick={onStart}
          >
            <span className="cta-text">Начать открывать город</span>
            <span className="cta-arrow">⟶</span>
          </button>

          <div className="team-signature">
            от команды «may»
          </div>
        </div>
      </div>
    </div>
  );
}