import React from 'react';
import '../styles/AccessibilityMode.css';

export default function AccessibilityMode({ language, accessibilityMode, onSelect }) {
  const translations = {
    en: {
      title: 'Display Settings',
      normalMode: 'Standard Mode',
      normalDesc: 'Regular text size and colors',
      accessMode: 'Accessibility Mode',
      accessDesc: 'Large text, high contrast',
      continue: 'Continue',
    },
    hi: {
      title: 'डिस्प्ले सेटिंग्स',
      normalMode: 'मानक मोड',
      normalDesc: 'नियमित टेक्स्ट आकार और रंग',
      accessMode: 'एक्सेसिबिलिटी मोड',
      accessDesc: 'बड़ा टेक्स्ट, उच्च कंट्रास्ट',
      continue: 'जारी रखें',
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div className={`accessibility-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="access-container">
        <h1>{t.title}</h1>
        <div className="mode-options">
          <button
            className={`mode-option ${!accessibilityMode ? 'selected' : ''}`}
            onClick={() => onSelect(false)}
          >
            <div className="mode-icon">👁️</div>
            <h2>{t.normalMode}</h2>
            <p>{t.normalDesc}</p>
          </button>
          <button
            className={`mode-option ${accessibilityMode ? 'selected' : ''}`}
            onClick={() => onSelect(true)}
          >
            <div className="mode-icon">🔤</div>
            <h2>{t.accessMode}</h2>
            <p>{t.accessDesc}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
