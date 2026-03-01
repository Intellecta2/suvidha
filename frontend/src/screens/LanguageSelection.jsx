import React from 'react';
import '../styles/LanguageSelection.css';

export default function LanguageSelection({ language, accessibilityMode, onSelect }) {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ka', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  ];

  return (
    <div className={`language-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="language-container">
        <h1>Select Your Language</h1>
        <div className="language-grid">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-btn ${language === lang.code ? 'active' : ''}`}
              onClick={() => onSelect(lang.code)}
            >
              <div className="lang-name">{lang.nativeName}</div>
              <div className="lang-en">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
