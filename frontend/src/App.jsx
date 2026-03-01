import React, { useState, useEffect } from 'react';
import './App.css';
import WelcomeScreen from './screens/WelcomeScreen';
import LanguageSelection from './screens/LanguageSelection';
import AccessibilityMode from './screens/AccessibilityMode';
import Authentication from './screens/Authentication';
import MainDashboard from './screens/MainDashboard';
import BillPaymentFlow from './screens/BillPaymentFlow';
import ComplaintFlow from './screens/ComplaintFlow';
import StatusTracking from './screens/StatusTracking';
import DocumentUpload from './screens/DocumentUpload';
import ConfirmationScreen from './screens/ConfirmationScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import AdminDashboard from './screens/AdminDashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [language, setLanguage] = useState('en');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Listen for online/offline events
  useEffect(() => {
    import('./services/syncService').then(({ syncRequests, getQueueCount }) => {
      // Initialize queue count
      setOfflineQueueCount(getQueueCount());

      const handleOnline = () => {
        setIsOnline(true);
        console.log('Connection restored. Attempting sync...');
        syncRequests(API_URL).then(count => {
          if (count > 0) {
            console.log(`Synced ${count} offline requests`);
          }
          setOfflineQueueCount(getQueueCount());
        });
      };

      const handleOffline = () => setIsOnline(false);

      const handleQueueUpdate = () => {
        setOfflineQueueCount(getQueueCount());
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('offline-queue-updated', handleQueueUpdate);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('offline-queue-updated', handleQueueUpdate);
      };
    });
  }, [API_URL]);

  const handleCompleteOnboarding = () => {
    setCurrentScreen('authentication');
  };

  const handleAuthenticate = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentScreen('welcome');
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const screenProps = {
    language,
    accessibilityMode,
    setAccessibilityMode,
    user,
    isOnline,
    API_URL,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
  };

  return (
    <div className={`app ${accessibilityMode ? 'accessibility-mode' : ''} ${isOnline ? 'online' : 'offline'}`}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          {...screenProps}
          onProceed={handleCompleteOnboarding}
          onLanguageSelect={setLanguage}
          onAccessibilitySelect={setAccessibilityMode}
        />
      )}

      {currentScreen === 'language' && (
        <LanguageSelection
          {...screenProps}
          onSelect={(lang) => {
            setLanguage(lang);
            handleCompleteOnboarding();
          }}
        />
      )}

      {currentScreen === 'accessibility' && (
        <AccessibilityMode
          {...screenProps}
          onSelect={(mode) => {
            setAccessibilityMode(mode);
            setCurrentScreen('authentication');
          }}
        />
      )}

      {currentScreen === 'authentication' && !isAuthenticated && (
        <Authentication
          {...screenProps}
          onAuthenticate={handleAuthenticate}
        />
      )}

      {currentScreen === 'dashboard' && isAuthenticated && (
        <MainDashboard
          {...screenProps}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'bill-payment' && isAuthenticated && (
        <BillPaymentFlow
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'complaint' && isAuthenticated && (
        <ComplaintFlow
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'document-upload' && isAuthenticated && (
        <DocumentUpload
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'status-tracking' && isAuthenticated && (
        <StatusTracking
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'confirmation' && (
        <ConfirmationScreen
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'receipt' && (
        <ReceiptScreen
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminDashboard
          {...screenProps}
          onNavigate={handleNavigate}
        />
      )}

      {!isOnline && (
        <div className="offline-indicator">
          <span>Offline Mode. {offlineQueueCount > 0 ? `${offlineQueueCount} requests pending sync.` : 'Requests will sync when connected'}</span>
        </div>
      )}
    </div>
  );
}

export default App;
