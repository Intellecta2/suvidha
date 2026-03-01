import React, { useState } from 'react';
import '../styles/Authentication.css';

export default function Authentication({ language, accessibilityMode, onAuthenticate, API_URL, isOnline }) {
  const [step, setStep] = useState('mobile'); // mobile, otp
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [displayOtp, setDisplayOtp] = useState(''); // For demo purposes

  const translations = {
    en: {
      title: 'Authenticate',
      enterMobile: 'Enter Your Mobile Number',
      mobilePlaceholder: 'Mobile number (10 digits)',
      requestOtp: 'Request OTP',
      enterOtp: 'Enter OTP',
      otpPlaceholder: 'Enter 6-digit OTP',
      verify: 'Verify OTP',
      demoOtp: 'Demo OTP: ',
      resendOtp: 'Resend OTP',
    },
    hi: {
      title: 'प्रमाणीकरण',
      enterMobile: 'अपना मोबाइल नंबर दर्ज करें',
      mobilePlaceholder: 'मोबाइल नंबर (10 अंक)',
      requestOtp: 'OTP प्राप्त करें',
      enterOtp: 'OTP दर्ज करें',
      otpPlaceholder: '6-अंकीय OTP दर्ज करें',
      verify: 'OTP सत्यापित करें',
      demoOtp: 'डेमो OTP: ',
      resendOtp: 'OTP दोबारा भेजें',
    },
  };

  const t = translations[language] || translations.en;

  const handleRequestOtp = async () => {
    setError('');
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber }),
      });
      const data = await response.json();
      if (data.otp) {
        setDisplayOtp(data.otp);
        setSessionId(data.session_id);
        setStep('otp');
      }
    } catch (err) {
      // Fallback for prototype when backend is offline
      console.log('Backend unreachable, using mock OTP flow');
      setTimeout(() => {
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setDisplayOtp(mockOtp);
        setSessionId('mock-session-' + Date.now());
        setStep('otp');
        setLoading(false);
      }, 800);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          otp,
          session_id: sessionId,
        }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        onAuthenticate(data.user);
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      // Fallback for prototype when backend is offline
      console.log('Backend unreachable, using mock verification flow');
      setTimeout(() => {
        if (otp === displayOtp) {
          localStorage.setItem('auth_token', 'mock_token_123');
          onAuthenticate({ id: 'user_1', mobile_number: mobileNumber, name: `User ${mobileNumber.slice(-4)}` });
        } else {
          setError('Invalid OTP');
        }
        setLoading(false);
      }, 800);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="auth-container">
        <div className="auth-header">
          <h1>{t.title}</h1>
        </div>

        <div className="auth-form">
          {step === 'mobile' ? (
            <>
              <label className="form-label">{t.enterMobile}</label>
              <input
                type="tel"
                className="form-input"
                placeholder={t.mobilePlaceholder}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength="10"
              />
              <button
                className="cta-button"
                onClick={handleRequestOtp}
                disabled={loading || mobileNumber.length !== 10}
              >
                {loading ? 'Sending...' : t.requestOtp}
              </button>
            </>
          ) : (
            <>
              <label className="form-label">{t.enterOtp}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t.otpPlaceholder}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
              />
              <div className="demo-otp-display">
                {t.demoOtp}
                <strong>{displayOtp}</strong>
              </div>
              <button
                className="cta-button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : t.verify}
              </button>
              <button className="secondary-button" onClick={() => setStep('mobile')}>
                {t.resendOtp}
              </button>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}
