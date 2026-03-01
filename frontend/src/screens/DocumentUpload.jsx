import React, { useState } from 'react';
import '../styles/DocumentUpload.css';
import { enqueueRequest } from '../services/syncService';

export default function DocumentUpload({ language, accessibilityMode, user, isOnline, API_URL, onNavigate }) {
  const [step, setStep] = useState('type'); // type, upload, confirmation
  const [docType, setDocType] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docId, setDocId] = useState('');

  const documentTypes = [
    { id: 'aadhar', label: 'Aadhar Card', icon: '🆔' },
    { id: 'id', label: 'ID Proof', icon: '📋' },
    { id: 'address', label: 'Address Proof', icon: '🏠' },
    { id: 'bill', label: 'Bill Copy', icon: '📄' },
    { id: 'other', label: 'Other', icon: '📎' },
  ];

  const translations = {
    en: {
      title: 'Upload Documents',
      selectDoc: 'Select document type',
      upload: 'Upload File',
      selecting: 'Select a file',
      uploading: 'Uploading...',
      confirmation: 'Document uploaded successfully',
      docId: 'Document ID',
      uploadAnother: 'Upload Another',
      done: 'Done',
    },
    hi: {
      title: 'दस्तावेज़ अपलोड करें',
      selectDoc: 'दस्तावेज़ प्रकार चुनें',
      upload: 'फ़ाइल अपलोड करें',
      selecting: 'एक फ़ाइल चुनें',
      uploading: 'अपलोड हो रहा है...',
      confirmation: 'दस्तावेज़ सफलतापूर्वक अपलोड किया गया',
      docId: 'दस्तावेज़ आईडी',
      uploadAnother: 'दूसरा अपलोड करें',
      done: 'पूर्ण',
    },
  };

  const t = translations[language] || translations.en;

  const handleDocTypeSelect = (type) => {
    setDocType(type);
    setStep('upload');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: user.mobile_number,
          document_type: docType?.id,
          file_name: file?.name || 'document',
        }),
      });
      const data = await response.json();
      if (data.document_id) {
        setDocId(data.document_id);
        setStep('confirmation');
      }
    } catch (err) {
      if (!isOnline) {
        // Enqueue offline request
        enqueueRequest('/api/documents/upload', 'POST', {
          mobile_number: user.mobile_number,
          document_type: docType?.id,
          file_name: fileName || 'document',
        }, { action: 'upload_document' });

        setDocId(`OFFLINE-${Date.now()}`);
        setStep('confirmation');
      } else {
        setError('Upload failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'upload') {
      setStep('type');
      setDocType(null);
      setFileName('');
      setError('');
    } else if (step === 'confirmation') {
      onNavigate('dashboard');
    }
  };

  return (
    <div className={`document-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="document-container">
        <div className="document-header">
          {step !== 'type' && (
            <button className="back-btn" onClick={handleBack}>← Back</button>
          )}
          <h1>{t.title}</h1>
        </div>

        {step === 'type' && (
          <div className="doc-type-selection">
            <p className="instruction">{t.selectDoc}</p>
            <div className="doc-types-grid">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  className="doc-type-btn"
                  onClick={() => handleDocTypeSelect(type)}
                >
                  <div className="doc-icon">{type.icon}</div>
                  <div className="doc-label">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'upload' && docType && (
          <div className="upload-form">
            <div className="upload-box">
              <input
                type="file"
                id="file-input"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-label">
                <div className="file-icon">📁</div>
                <p>{fileName || t.selecting}</p>
              </label>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {step === 'confirmation' && (
          <div className="confirmation">
            <div className="success-icon">✓</div>
            <h2>{t.confirmation}</h2>
            <div className="doc-id-display">
              <p className="id-label">{t.docId}</p>
              <p className="id-value">{docId}</p>
            </div>
            <div className="confirmation-actions">
              <button className="cta-button" onClick={() => {
                setDocType(null);
                setFileName('');
                setStep('type');
              }}>
                {t.uploadAnother}
              </button>
              <button className="secondary-button" onClick={() => onNavigate('dashboard')}>
                {t.done}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
