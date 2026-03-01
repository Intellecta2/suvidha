import React, { useState } from 'react';
import '../styles/ComplaintFlow.css';
import { enqueueRequest } from '../services/syncService';

export default function ComplaintFlow({ language, accessibilityMode, user, isOnline, API_URL, onNavigate }) {
  const [step, setStep] = useState('category'); // category, form, confirmation
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [voiceNote, setVoiceNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'water', label: 'Water Supply', icon: '💧' },
    { id: 'electricity', label: 'Electricity', icon: '⚡' },
    { id: 'streetlight', label: 'Streetlight', icon: '💡' },
    { id: 'road', label: 'Road Damage', icon: '🛣️' },
    { id: 'waste', label: 'Waste Management', icon: '🗑️' },
    { id: 'other', label: 'Other', icon: '📝' },
  ];

  const translations = {
    en: {
      title: 'Report a Problem',
      selectIssue: 'What is your issue?',
      describe: 'Describe your problem',
      describePlaceholder: 'Describe your issue in detail',
      address: 'Location (optional)',
      locationPlaceholder: 'Your location',
      attachments: 'Attachments',
      addMedia: 'Add Photos/Videos',
      recordVoice: 'Record Voice Note',
      recording: 'Recording...',
      submit: 'Submit Complaint',
      submitError: 'Failed to submit complaint. Try again.',
      confirmation: 'Complaint registered',
      storedOffline: 'Saved locally (will sync when online)',
      ticket: 'Your Ticket Number',
      track: 'Track Status',
      dashboard: 'Go to Dashboard',
      categories: {
        'Water Supply': 'Water Supply',
        'Electricity': 'Electricity',
        'Waste Collection': 'Waste Collection',
        'Roads & Pavements': 'Roads & Pavements',
        'Public Health': 'Public Health',
      }
    },
    hi: {
      title: 'समस्या की रिपोर्ट करें',
      selectIssue: 'आपकी समस्या क्या है?',
      describe: 'अपनी समस्या का विवरण दें',
      describePlaceholder: 'अपनी समस्या का विस्तार से वर्णन करें',
      address: 'स्थान (वैकल्पिक)',
      locationPlaceholder: 'आपका स्थान',
      attachments: 'संलग्नक',
      addMedia: 'तस्वीरें/वीडियो जोड़ें',
      recordVoice: 'वॉइस नोट रिकॉर्ड करें',
      recording: 'रिकॉर्डिंग...',
      submit: 'शिकायत जमा करें',
      submitError: 'शिकायत जमा करने में विफल। पुनः प्रयास करें।',
      confirmation: 'शिकायत दर्ज की गई',
      storedOffline: 'स्थानीय रूप से सहेजा गया (ऑनलाइन होने पर सिंक होगा)',
      ticket: 'आपका टिकट नंबर',
      track: 'स्थिति देखें',
      dashboard: 'डैशबोर्ड पर जाएं',
      categories: {
        'Water Supply': 'जल आपूर्ति',
        'Electricity': 'बिजली',
        'Waste Collection': 'कचरा संग्रहण',
        'Roads & Pavements': 'सड़कें और फुटपाथ',
        'Public Health': 'सार्वजनिक स्वास्थ्य',
      }
    },
  };

  const t = translations[language] || translations.en;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep('form');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceNote({ name: 'voice_note_1.mp3', size: 1024 * 150 }); // Mock voice note
    } else {
      setIsRecording(true);
      setTimeout(() => setIsRecording(false), 3000); // Auto-mock stop after 3s
    }
  };

  const handleSubmitComplaint = async () => {
    if (!selectedCategory || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: user.mobile_number,
          service_type: selectedCategory.id,
          category: selectedCategory.id,
          description,
          address,
        }),
      });
      const data = await response.json();
      if (data.ticket_number) {
        setTicketNumber(data.ticket_number);
        setStep('confirmation');
      }
    } catch (err) {
      if (!isOnline) {
        // Enqueue offline request
        enqueueRequest('/api/complaints', 'POST', {
          mobile_number: user.mobile_number,
          service_type: selectedCategory.id,
          category: selectedCategory.id,
          description,
          address,
          media_files: mediaFiles.map(f => f.name),
          has_voice_note: !!voiceNote,
        }, { action: 'create_complaint' });

        setTicketNumber(`OFFLINE-${Date.now()}`);
        setStep('confirmation');
      } else {
        setError(t.submitError || 'Failed to submit complaint. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('category');
      setSelectedCategory(null);
      setDescription('');
      setAddress('');
      setMediaFiles([]);
      setVoiceNote(null);
      setError('');
    } else if (step === 'confirmation') {
      onNavigate('dashboard');
    }
  };

  return (
    <div className={`complaint-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="complaint-container">
        <div className="complaint-header">
          {step !== 'category' && (
            <button className="back-btn" onClick={handleBack}>← {t.back}</button>
          )}
          <h1>{t.title}</h1>
        </div>

        {step === 'category' && (
          <div className="category-selection">
            <p className="instruction">{t.selectIssue}</p>
            <div className="categories-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="category-btn"
                  onClick={() => handleCategorySelect(cat)}
                >
                  <div className="cat-icon">{cat.icon}</div>
                  <div className="cat-label">{t.categories[cat.label]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && selectedCategory && (
          <div className="complaint-form">
            <div className="form-group">
              <label className="form-label">{t.describe}</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.describePlaceholder || "Describe your issue in detail"}
                rows={5}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.address}</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.locationPlaceholder || "Your location"}
              />
            </div>

            <div className="form-group media-group">
              <label className="form-label">{t.attachments}</label>
              <div className="media-actions">
                <input
                  type="file"
                  id="media-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="media-upload" className="media-btn secondary-button">
                  📷 {t.addMedia}
                </label>

                <button
                  type="button"
                  className={`media-btn voice-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                >
                  🎙️ {isRecording ? t.recording : t.recordVoice}
                </button>
              </div>

              {(mediaFiles.length > 0 || voiceNote) && (
                <div className="attachments-preview">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="file-chip">
                      📄 {file.name}
                    </div>
                  ))}
                  {voiceNote && (
                    <div className="file-chip voice-chip">
                      🎵 {voiceNote.name}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="cta-button" onClick={handleSubmitComplaint} disabled={loading || isRecording}>
              {loading ? 'Submitting...' : t.submit}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {step === 'confirmation' && (
          <div className="confirmation">
            <div className={`success-icon ${ticketNumber.startsWith('OFFLINE') ? 'offline' : ''}`}>
              {ticketNumber.startsWith('OFFLINE') ? '☁️' : '✓'}
            </div>
            <h2>{ticketNumber.startsWith('OFFLINE') ? t.storedOffline : t.confirmation}</h2>
            <div className="ticket-display">
              <p className="ticket-label">{t.ticket}</p>
              <p className="ticket-number">{ticketNumber}</p>
            </div>
            <div className="confirmation-actions">
              <button className="cta-button" onClick={() => onNavigate('status-tracking')}>
                {t.track}
              </button>
              <button className="secondary-button" onClick={() => onNavigate('dashboard')}>
                {t.dashboard}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
