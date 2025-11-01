import './WelcomeScreen.css';
import TelegramOrb from '../ui/TelegramOrb';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
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

      <div className="welcome-card">
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

          <div className="team-and-telegram">
            <div className="team-signature">
              от команды «may»
            </div>
            <TelegramOrb />
          </div>
        </div>
      </div>
    </div>
  );
}