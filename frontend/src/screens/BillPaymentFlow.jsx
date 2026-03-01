import React, { useState, useEffect } from 'react';
import '../styles/BillPaymentFlow.css';

export default function BillPaymentFlow({ language, accessibilityMode, user, isOnline, API_URL, onNavigate }) {
  const [step, setStep] = useState('list'); // list, select, payment, confirmation
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionId, setTransactionId] = useState('');

  const translations = {
    en: {
      title: 'Pay Your Bills',
      selectBill: 'Select a bill to pay',
      loadingBills: 'Loading bills...',
      noBills: 'No pending bills found',
      dueDate: 'Due Date',
      amount: 'Amount',
      selectPayment: 'Select Payment Method',
      upi: 'UPI Payment',
      card: 'Debit Card',
      cash: 'Cash at Counter',
      pay: 'Proceed to Payment',
      confirmation: 'Payment confirmed',
      reference: 'Reference ID',
    },
    hi: {
      title: 'अपने बिल का भुगतान करें',
      selectBill: 'भुगतान करने के लिए एक बिल चुनें',
      loadingBills: 'बिल लोड हो रहे हैं...',
      noBills: 'कोई लंबित बिल नहीं मिला',
      dueDate: 'देय तारीख',
      amount: 'राशि',
      selectPayment: 'भुगतान विधि चुनें',
      upi: 'UPI भुगतान',
      card: 'डेबिट कार्ड',
      cash: 'काउंटर पर नकद',
      pay: 'भुगतान के लिए आगे बढ़ें',
      confirmation: 'भुगतान की पुष्टि',
      reference: 'संदर्भ आईडी',
    },
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/bills/${user.mobile_number}`);
        const data = await response.json();
        if (data.bills) {
          setBills(data.bills);
        }
      } catch (err) {
        setError('Cannot load bills. Check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [user.mobile_number, API_URL]);

  const handleBillSelect = (bill) => {
    setSelectedBill(bill);
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedBill) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bills/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_id: selectedBill.id,
          amount: selectedBill.amount,
          payment_method: paymentMethod,
          mobile_number: user.mobile_number,
        }),
      });
      const data = await response.json();
      if (data.transaction_id) {
        setTransactionId(data.transaction_ref);
        setStep('confirmation');
      }
    } catch (err) {
      setError('Payment processing failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('list');
      setSelectedBill(null);
    } else if (step === 'confirmation') {
      onNavigate('dashboard');
    }
  };

  return (
    <div className={`bill-payment-screen ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="payment-container">
        <div className="payment-header">
          <button className="back-btn" onClick={handleBack}>← Back</button>
          <h1>{t.title}</h1>
        </div>

        {step === 'list' && (
          <div className="bills-list">
            <p className="instruction">{t.selectBill}</p>
            {loading ? (
              <p className="loading">{t.loadingBills}</p>
            ) : bills.length === 0 ? (
              <p className="no-bills">{t.noBills}</p>
            ) : (
              <div className="bills-cards">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="bill-card"
                    onClick={() => handleBillSelect(bill)}
                  >
                    <div className="bill-type">{bill.bill_type.toUpperCase()}</div>
                    <div className="bill-amount">₹ {bill.amount}</div>
                    <div className="bill-info">
                      <span>{t.dueDate}: {bill.due_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'payment' && selectedBill && (
          <div className="payment-form">
            <div className="bill-summary">
              <h2>{selectedBill.bill_type.toUpperCase()}</h2>
              <div className="amount-display">₹ {selectedBill.amount}</div>
            </div>

            <div className="payment-methods">
              <label>{t.selectPayment}</label>
              <div className="methods-grid">
                {[
                  { id: 'upi', label: t.upi },
                  { id: 'card', label: t.card },
                  { id: 'cash', label: t.cash },
                ].map((method) => (
                  <button
                    key={method.id}
                    className={`method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="cta-button" onClick={handlePayment} disabled={loading}>
              {loading ? 'Processing...' : t.pay}
            </button>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="confirmation">
            <div className="success-icon">✓</div>
            <h2>{t.confirmation}</h2>
            <div className="confirmation-details">
              <p className="ref-label">{t.reference}</p>
              <p className="ref-value">{transactionId}</p>
            </div>
            <button className="cta-button" onClick={() => onNavigate('dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
