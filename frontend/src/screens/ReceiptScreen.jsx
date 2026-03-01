import React from 'react';
import '../styles/ReceiptScreen.css';

export default function ReceiptScreen({ language, accessibilityMode, onNavigate }) {
  const translations = {
    en: {
      title: 'Receipt',
      success: 'Transaction Successful',
      back: 'Back to Dashboard',
    },
    hi: {
      title: 'रसीद',
      success: 'लेनदेन सफल',
      back: 'डैशबोर्ड पर वापस',
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div className={`receipt-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="receipt-container">
        <div className="receipt-header">
          <h1>{t.title}</h1>
          <p>{t.success}</p>
        </div>
        <button className="cta-button" onClick={() => onNavigate('dashboard')}>
          {t.back}
        </button>
      </div>
    </div>
  );
}
