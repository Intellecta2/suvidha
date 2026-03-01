import React from 'react';
import '../styles/ConfirmationScreen.css';

export default function ConfirmationScreen({ language, accessibilityMode, onNavigate }) {
  const translations = {
    en: {
      title: 'Transaction Confirmed',
      message: 'Your request has been processed successfully',
      btn: 'Go to Dashboard',
    },
    hi: {
      title: 'लेनदेन की पुष्टि',
      message: 'आपका अनुरोध सफलतापूर्वक संसाधित किया गया है',
      btn: 'डैशबोर्ड पर जाएं',
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div className={`confirmation-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="confirmation-container">
        <div className="success-animation">✓</div>
        <h1>{t.title}</h1>
        <p>{t.message}</p>
        <button className="cta-button" onClick={() => onNavigate('dashboard')}>
          {t.btn}
        </button>
      </div>
    </div>
  );
}
