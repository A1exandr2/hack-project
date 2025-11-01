import './TelegramOrb.css';

export default function TelegramOrb() {
  const openTelegram = () => {
    window.open('https://t.me/tourist_assistant_may_bot', '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      className="telegram-button"
      onClick={openTelegram}
      aria-label="Открыть в Telegram"
    >
      <img
        src="/4886998-middle.png"
        alt="Telegram"
        className="telegram-icon"
      />
    </button>
  );
}