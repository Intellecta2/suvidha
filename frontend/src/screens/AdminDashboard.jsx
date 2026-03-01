import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';

export default function AdminDashboard({ language, accessibilityMode, API_URL, onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  const translations = {
    en: {
      title: 'Admin Dashboard',
      overview: 'Overview',
      complaints: 'Complaints',
      totalUsers: 'Total Users',
      totalTransactions: 'Total Transactions',
      totalComplaints: 'Total Complaints',
      totalRevenue: 'Total Revenue',
      paidBills: 'Paid Bills',
      pendingBills: 'Pending Bills',
      weeklyUsage: 'Weekly Usage',
      monthlyUsage: 'Monthly Usage',
      complaintStats: 'Complaint Statistics',
      registered: 'Registered',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
      recent: 'Recent Complaints',
    },
    hi: {
      title: 'व्यवस्थापक डैशबोर्ड',
      overview: 'अवलोकन',
      complaints: 'शिकायतें',
      totalUsers: 'कुल उपयोगकर्ता',
      totalTransactions: 'कुल लेनदेन',
      totalComplaints: 'कुल शिकायतें',
      totalRevenue: 'कुल राजस्व',
      paidBills: 'भुगतान किए गए बिल',
      pendingBills: 'लंबित बिल',
      weeklyUsage: 'साप्ताहिक उपयोग',
      monthlyUsage: 'मासिक उपयोग',
      complaintStats: 'शिकायत सांख्यिकी',
      registered: 'पंजीकृत',
      inProgress: 'प्रक्रिया में',
      resolved: 'समाधान किया गया',
      closed: 'बंद किया गया',
      recent: 'हाल की शिकायतें',
    },
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticRes, complaintRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/analytics`),
          fetch(`${API_URL}/api/admin/complaints`),
        ]);
        const analyticData = await analyticRes.json();
        const complaintData = await complaintRes.json();
        setAnalytics(analyticData.analytics);
        setComplaints(complaintData);
      } catch (err) {
        console.error('Admin data load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className={`admin-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
        <div className="admin-container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="admin-container">
        <div className="admin-header">
          <h1>{t.title}</h1>
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>← Exit</button>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            {t.overview}
          </button>
          <button
            className={`tab-btn ${selectedTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setSelectedTab('complaints')}
          >
            {t.complaints}
          </button>
        </div>

        {selectedTab === 'overview' && analytics && (
          <div className="admin-overview">
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>{t.totalUsers}</h3>
                <p className="metric-value">{analytics.total_users}</p>
              </div>
              <div className="metric-card">
                <h3>{t.totalTransactions}</h3>
                <p className="metric-value">{analytics.total_transactions}</p>
              </div>
              <div className="metric-card">
                <h3>{t.totalComplaints}</h3>
                <p className="metric-value">{analytics.total_complaints}</p>
              </div>
              <div className="metric-card">
                <h3>{t.totalRevenue}</h3>
                <p className="metric-value">₹ {analytics.total_revenue}</p>
              </div>
              <div className="metric-card">
                <h3>{t.paidBills}</h3>
                <p className="metric-value">{analytics.paid_bills}</p>
              </div>
              <div className="metric-card">
                <h3>{t.pendingBills}</h3>
                <p className="metric-value">{analytics.pending_bills}</p>
              </div>
            </div>

            <div className="usage-section">
              <h2>Kiosk Usage</h2>
              <div className="usage-cards">
                <div className="usage-card">
                  <p>{t.weeklyUsage}</p>
                  <strong>{analytics.kiosk_usage?.this_week || 0}</strong>
                </div>
                <div className="usage-card">
                  <p>{t.monthlyUsage}</p>
                  <strong>{analytics.kiosk_usage?.this_month || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'complaints' && complaints && (
          <div className="admin-complaints">
            <div className="complaint-stats">
              <h2>{t.complaintStats}</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">{t.registered}</span>
                  <strong className="stat-value">{complaints.status_breakdown?.registered || 0}</strong>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t.inProgress}</span>
                  <strong className="stat-value">{complaints.status_breakdown?.in_progress || 0}</strong>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t.resolved}</span>
                  <strong className="stat-value">{complaints.status_breakdown?.resolved || 0}</strong>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t.closed}</span>
                  <strong className="stat-value">{complaints.status_breakdown?.closed || 0}</strong>
                </div>
              </div>
            </div>

            <div className="recent-complaints">
              <h2>{t.recent}</h2>
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.recent_complaints?.slice(0, 10).map((complaint) => (
                    <tr key={complaint.id}>
                      <td>{complaint.ticket_number}</td>
                      <td>{complaint.service_type}</td>
                      <td className={`status-${complaint.status}`}>{complaint.status}</td>
                      <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
