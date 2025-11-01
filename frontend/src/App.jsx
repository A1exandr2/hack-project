import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import QuestionForm from './components/form/QuestionForm';
import ItineraryDisplay from './components/itinerary/ItineraryDisplay';
import './App.css';

function App() {
  const [plan, setPlan] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      const settings = JSON.parse(saved);
      document.documentElement.setAttribute('data-color-scheme', settings.colorScheme);
      document.documentElement.style.fontSize = `${settings.fontSize}%`;
      if (!settings.effects) {
        document.documentElement.classList.add('no-effects');
      }
    } else {
      // Контрастная тема по умолчанию
      document.documentElement.setAttribute('data-color-scheme', 'contrast');
      document.documentElement.style.fontSize = '100%';
      document.documentElement.classList.add('no-effects');
    }

    const hasSeen = localStorage.getItem('hasSeenWelcome');
    if (hasSeen) setShowWelcome(false);
  }, []);

  const handleStart = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleNewRoute = () => {
    setPlan(null);
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className="app">
      <Header />
      <main className="container">
        {!plan ? (
          <QuestionForm onPlanReceived={setPlan} />
        ) : (
          <ItineraryDisplay planData={plan} onNewRoute={handleNewRoute} />
        )}
      </main>
      <Footer />
      {/* УБРАЛИ СТАРУЮ ФИКСИРОВАННУЮ КНОПКУ ЗДЕСЬ */}
    </div>
  );
}

export default App;