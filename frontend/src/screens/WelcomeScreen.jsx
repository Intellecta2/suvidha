import React from 'react';
import '../styles/WelcomeScreen.css';

export default function WelcomeScreen({ language, accessibilityMode, onProceed, onLanguageSelect, onAccessibilitySelect }) {
  const translations = {
    en: {
      title: 'Welcome to JanSetu SUVIDHA',
      subtitle: 'Unified Civic Service Kiosk',
      description: 'Pay bills • Register complaints • Track status • Upload documents',
      proceed: 'Let\'s Get Started',
      selectLanguage: 'Select Language',
      selectMode: 'Choose Display Mode',
    },
    hi: {
      title: 'JanSetu SUVIDHA में आपका स्वागत है',
      subtitle: 'एकीकृत नागरिक सेवा किओस्क',
      description: 'बिलों का भुगतान करें • शिकायत दर्ज करें • स्थिति ट्रैक करें • दस्तावेज़ अपलोड करें',
      proceed: 'शुरू करें',
      selectLanguage: 'भाषा चुनें',
      selectMode: 'डिस्प्ले मोड चुनें',
    },
    ta: {
      title: 'JanSetu SUVIDHA-க்கு உங்களை வரவேற்கிறோம்',
      subtitle: 'ஒருங்கிணைந்த சிவிக் சேவை கியோஸ்க்',
      description: 'கட்டணங்களை செலுத்தவும் • புகாரை பதிவு செய்யவும் • நிலையை ट্যாக் செய்யவும் • ஆவணங்களைอัปโหลดு செய்யவும்',
      proceed: 'தொடங்குவோம்',
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      selectMode: 'காட்சி முறையைத் தேர்ந்தெடுக்கவும்',
    },
  };

  const t = translations[language] || translations.en;

  return (
    <div className={`welcome-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>

        <div className="welcome-content">
          <div className="info-box">
            <p className="description">{t.description}</p>
          </div>

          <div className="options-section">
            <div className="language-selector">
              <label>{t.selectLanguage}</label>
              <div className="button-group">
                <button
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => onLanguageSelect('en')}
                >
                  English
                </button>
                <button
                  className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => onLanguageSelect('hi')}
                >
                  हिन्दी
                </button>
                <button
                  className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
                  onClick={() => onLanguageSelect('ta')}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            <div className="accessibility-selector">
              <label>{t.selectMode}</label>
              <div className="button-group">
                <button
                  className={`mode-btn ${!accessibilityMode ? 'active' : ''}`}
                  onClick={() => onAccessibilitySelect(false)}
                >
                  Normal Mode
                </button>
                <button
                  className={`mode-btn ${accessibilityMode ? 'active' : ''}`}
                  onClick={() => onAccessibilitySelect(true)}
                >
                  Large Text Mode
                </button>
              </div>
            </div>
          </div>

          <button className="cta-button proceed-btn" onClick={onProceed}>
            {t.proceed}
          </button>
        </div>

        <div className="welcome-footer">
          <p>Government of India | Department of Telecommunications - C-DAC SUVIDHA 2026</p>
        </div>
      </div>
    </div>
  );
}
