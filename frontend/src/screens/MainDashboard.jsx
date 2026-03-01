import React, { useState, useEffect } from 'react';
import '../styles/MainDashboard.css';

export default function MainDashboard({ language, accessibilityMode, user, API_URL, onNavigate, onLogout }) {
  const [serviceOptions] = useState([
    { id: 'bill', label: 'Pay Bills', icon: '💳', color: '#E74C3C' },
    { id: 'complaint', label: 'Report Issue', icon: '📋', color: '#3498DB' },
    { id: 'status', label: 'Track Status', icon: '📍', color: '#2ECC71' },
    { id: 'documents', label: 'Upload Docs', icon: '📄', color: '#F39C12' },
  ]);

  const translations = {
    en: {
      title: 'Civic Services',
      selectService: 'What would you like to do?',
      logout: 'Logout',
      welcome: 'Hello',
      footer: 'Available 24/7 | Multilingual Support | Secure & Verified',
      services: {
        bill: 'Pay Bills',
        complaint: 'Report Issue',
        status: 'Track Status',
        documents: 'Upload Docs',
      }
    },
    hi: {
      title: 'नागरिक सेवाएं',
      selectService: 'आप क्या करना चाहते हैं?',
      logout: 'लॉगआउट',
      welcome: 'नमस्ते',
      footer: '24/7 उपलब्ध | बहुभाषी समर्थन | सुरक्षित और सत्यापित',
      services: {
        bill: 'बिल भुगतान करें',
        complaint: 'शिकायत दर्ज करें',
        status: 'स्थिति जांचें',
        documents: 'दस्तावेज़ अपलोड करें',
      }
    },
  };

  const t = translations[language] || translations.en;

  const handleServiceClick = (serviceId) => {
    const routes = {
      bill: 'bill-payment',
      complaint: 'complaint',
      status: 'status-tracking',
      documents: 'document-upload',
    };
    onNavigate(routes[serviceId]);
  };

  return (
    <div className={`dashboard-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="dashboard-header">
        <div className="user-info">
          <h2>{t.welcome}, {user?.name || 'User'}</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          {t.logout}
        </button>
      </div>

      <div className="dashboard-content">
        <h1>{t.title}</h1>
        <p className="subtitle">{t.selectService}</p>

        <div className="services-grid">
          {serviceOptions.map((service) => (
            <button
              key={service.id}
              className="service-card"
              style={{ borderTop: `4px solid ${service.color}` }}
              onClick={() => handleServiceClick(service.id)}
            >
              <div className="service-icon">{service.icon}</div>
              <div className="service-label">{t.services[service.id]}</div>
            </button>
          ))}
        </div>

        <div className="dashboard-footer">
          <p>{t.footer}</p>
        </div>
      </div>
    </div>
  );
}
