import './Header.css';
import { useState } from 'react';
import AboutPage from '../about/AboutPage';
import AccessibilitySettings from '../accessibility/AccessibilitySettings';

const Header = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="main-title">
                AI-помощник туриста по Нижнему Новгороду
              </h1>
              <p className="main-subtitle">
                Постройте свой идеальный маршрут по самым красивым местам города
              </p>
            </div>
            <div className="header-controls">
              {/* Кнопки навигации */}
              <nav className="nav-menu">
                <button
                  onClick={() => window.location.reload()}
                  className="nav-button"
                >
                  Главная
                </button>
                <button
                  onClick={() => setShowAbout(true)}
                  className="nav-button"
                >
                  О сервисе
                </button>
              </nav>
              <AccessibilitySettings />
            </div>
          </div>
        </div>
      </header>

      {/* Модальное окно "О сервисе" */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AboutPage onClose={() => setShowAbout(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;