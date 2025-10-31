import './Header.css';
import { useState } from 'react'; // ДОБАВЬТЕ ЭТОТ ИМПОРТ

// ВРЕМЕННЫЙ КОМПОНЕНТ НАСТРОЕК ПРЯМО В HEADER
const TempAccessibility = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const changeTheme = (theme) => {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('theme', theme);
  };

  const changeFontSize = (size) => {
    document.documentElement.style.fontSize = `${size}%`;
    localStorage.setItem('fontSize', size);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ⚙️
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '8px',
          minWidth: '200px',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(20px)',
          zIndex: 1000
        }}>
          <h4 style={{margin: '0 0 12px 0'}}>Настройки</h4>
          
          <div style={{marginBottom: '12px'}}>
            <label>Тема:</label>
            <select 
              onChange={(e) => changeTheme(e.target.value)}
              style={{width: '100%', padding: '8px', marginTop: '6px', borderRadius: '6px'}}
            >
              <option value="default">Стандартная</option>
              <option value="contrast">Контрастная</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
          
          <div>
            <label>Размер текста:</label>
            <div style={{display: 'flex', gap: '6px', marginTop: '6px'}}>
              <button onClick={() => changeFontSize(100)} style={{flex: 1, padding: '6px'}}>100%</button>
              <button onClick={() => changeFontSize(125)} style={{flex: 1, padding: '6px'}}>125%</button>
              <button onClick={() => changeFontSize(150)} style={{flex: 1, padding: '6px'}}>150%</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  return (
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
            <TempAccessibility />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;