import React, { useState, useEffect } from 'react';
import '../styles/StatusTracking.css';

export default function StatusTracking({ language, accessibilityMode, user, API_URL, onNavigate }) {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'Track Your Complaints',
      loading: 'Loading complaints...',
      noComplaints: 'No complaints found',
      status: 'Status',
      registered: 'Registered',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
      details: 'Complaint Details',
      ticket: 'Ticket Number',
      category: 'Category',
      description: 'Description',
      timeline: 'Timeline',
      back: 'Back to List',
    },
    hi: {
      title: 'अपनी शिकायतों को ट्रैक करें',
      loading: 'शिकायतें लोड हो रही हैं...',
      noComplaints: 'कोई शिकायत नहीं मिली',
      status: 'स्थिति',
      registered: 'पंजीकृत',
      inProgress: 'प्रक्रिया में',
      resolved: 'समाधान किया गया',
      closed: 'बंद किया गया',
      details: 'शिकायत विवरण',
      ticket: 'टिकट नंबर',
      category: 'श्रेणी',
      description: 'विवरण',
      timeline: 'समयरेखा',
      back: 'सूची में वापस',
    },
  };

  const t = translations[language] || translations.en;

  const statusColors = {
    registered: '#3498DB',
    in_progress: '#F39C12',
    resolved: '#2ECC71',
    closed: '#95A5A6',
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/complaints/${user.mobile_number}`);
        const data = await response.json();
        if (data.complaints) {
          setComplaints(data.complaints);
        }
      } catch (err) {
        setError('Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user.mobile_number, API_URL]);

  const getStatusLabel = (status) => {
    const statusMap = {
      registered: t.registered,
      in_progress: t.inProgress,
      resolved: t.resolved,
      closed: t.closed,
    };
    return statusMap[status] || status;
  };

  return (
    <div className={`tracking-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="tracking-container">
        <div className="tracking-header">
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>← Back</button>
          <h1>{t.title}</h1>
        </div>

        {!selectedComplaint ? (
          <div className="complaints-list">
            {loading ? (
              <p className="loading">{t.loading}</p>
            ) : complaints.length === 0 ? (
              <p className="no-data">{t.noComplaints}</p>
            ) : (
              <div className="complaints-cards">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="complaint-card"
                    onClick={() => setSelectedComplaint(complaint)}
                    style={{ borderLeft: `4px solid ${statusColors[complaint.status]}` }}
                  >
                    <div className="complaint-header">
                      <strong>{complaint.ticket_number}</strong>
                      <span className="status-badge" style={{ backgroundColor: statusColors[complaint.status] }}>
                        {getStatusLabel(complaint.status)}
                      </span>
                    </div>
                    <p className="complaint-desc">{complaint.description}</p>
                    <small>{new Date(complaint.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <div className="complaint-detail">
            <button className="back-btn" onClick={() => setSelectedComplaint(null)}>
              {t.back}
            </button>

            <div className="detail-header">
              <h2>{t.details}</h2>
              <span
                className="status-badge"
                style={{ backgroundColor: statusColors[selectedComplaint.status] }}
              >
                {getStatusLabel(selectedComplaint.status)}
              </span>
            </div>

            <div className="detail-content">
              <div className="detail-row">
                <label>{t.ticket}:</label>
                <strong>{selectedComplaint.ticket_number}</strong>
              </div>
              <div className="detail-row">
                <label>{t.category}:</label>
                <strong>{selectedComplaint.service_type}</strong>
              </div>
              <div className="detail-row full">
                <label>{t.description}:</label>
                <p>{selectedComplaint.description}</p>
              </div>

              <div className="timeline-section">
                <h3>{t.timeline}</h3>
                <div className="timeline">
                  {selectedComplaint.timeline && selectedComplaint.timeline.map((event, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot" style={{ backgroundColor: statusColors[event.status] }}></div>
                      <div className="timeline-content">
                        <strong>{getStatusLabel(event.status)}</strong>
                        <p>{event.update}</p>
                        <small>{new Date(event.timestamp).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
