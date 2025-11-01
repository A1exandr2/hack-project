import { useState, useEffect } from 'react';
import './AccessibilitySettings.css';

const AccessibilitySettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    colorScheme: 'contrast',
    fontSize: 100,
    effects: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    } else {
      applySettings({ colorScheme: 'contrast', fontSize: 100, effects: false });
    }
  }, []);

  const applySettings = (newSettings) => {
    document.documentElement.setAttribute('data-color-scheme', newSettings.colorScheme);
    document.documentElement.style.fontSize = `${newSettings.fontSize}%`;
    if (!newSettings.effects) {
      document.documentElement.classList.add('no-effects');
    } else {
      document.documentElement.classList.remove('no-effects');
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    if (key === 'colorScheme' && value !== 'default') {
      newSettings.effects = false;
    }
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    const defaultSettings = { colorScheme: 'contrast', fontSize: 100, effects: false };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(defaultSettings));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.accessibility-settings')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="accessibility-settings">
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Настройки доступности"
        aria-expanded={isOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L5 9.7V15.5L3 16.3V18.5L9 17V19H15V17L21 18.5V16.3L19 15.5V9.7L21 9ZM15 15H9V9H15V15Z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="accessibility-panel">
          <div className="accessibility-header">
            <h3>Настройки доступности</h3>
            <button className="reset-btn" onClick={resetSettings}>
              Сбросить
            </button>
          </div>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Цветовая схема:</label>
              <select
                value={settings.colorScheme}
                onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
              >
                <option value="default">Стандартная</option>
                <option value="contrast">Контрастная</option>
                <option value="dark">Тёмная</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Размер шрифта:</label>
              <div className="font-size-controls">
                <button
                  className={`size-btn ${settings.fontSize === 100 ? 'active' : ''}`}
                  onClick={() => handleSettingChange('fontSize', 100)}
                >
                  100%
                </button>
                <button
                  className={`size-btn ${settings.fontSize === 125 ? 'active' : ''}`}
                  onClick={() => handleSettingChange('fontSize', 125)}
                >
                  125%
                </button>
                <button
                  className={`size-btn ${settings.fontSize === 150 ? 'active' : ''}`}
                  onClick={() => handleSettingChange('fontSize', 150)}
                >
                  150%
                </button>
              </div>
            </div>
            <div className="setting-group">
              <div className="toggle-group">
                <div className="toggle-label">
                  <label>Эффекты анимации:</label>
                  <div className="toggle-description">
                    {settings.colorScheme !== 'default'
                      ? 'Доступно только в стандартной теме'
                      : 'Включить анимации'}
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.effects}
                    onChange={(e) => handleSettingChange('effects', e.target.checked)}
                    disabled={settings.colorScheme !== 'default'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          {settings.colorScheme !== 'default' && (
            <div className="settings-notice">
              Для лучшей читаемости в {settings.colorScheme === 'contrast' ? 'контрастной' : 'тёмной'} теме анимации отключены
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessibilitySettings;