const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database file paths
const dbDir = path.join(__dirname, 'data');
const createDbIfNotExists = () => {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
};

// Initialize database
createDbIfNotExists();

const dbFiles = {
  users: path.join(dbDir, 'users.json'),
  bills: path.join(dbDir, 'bills.json'),
  complaints: path.join(dbDir, 'complaints.json'),
  transactions: path.join(dbDir, 'transactions.json'),
  documents: path.join(dbDir, 'documents.json'),
  offline_queue: path.join(dbDir, 'offline_queue.json'),
};

// Helper: Read JSON file
const readDb = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Helper: Write JSON file
const writeDb = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// OTP Request
app.post('/api/auth/request-otp', (req, res) => {
  const { mobile_number } = req.body;
  
  if (!mobile_number || !/^\d{10}$/.test(mobile_number)) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[MOCK] OTP for ${mobile_number}: ${otp}`);

  res.json({
    success: true,
    message: 'OTP sent successfully',
    otp: otp, // In production, this would be sent via SMS
    session_id: uuidv4(),
  });
});

// OTP Verify
app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile_number, otp, session_id } = req.body;

  if (!mobile_number || !otp || !session_id) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Mock OTP verification (in production, validate against stored OTP)
  if (otp.length === 6) {
    const users = readDb(dbFiles.users);
    let user = users.find(u => u.mobile_number === mobile_number);

    if (!user) {
      user = {
        id: uuidv4(),
        mobile_number,
        name: `User ${mobile_number.slice(-4)}`,
        email: `user${mobile_number}@gov.in`,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      users.push(user);
      writeDb(dbFiles.users, users);
    } else {
      user.last_login = new Date().toISOString();
      writeDb(dbFiles.users, users);
    }

    const token = Buffer.from(JSON.stringify({ user_id: user.id, mobile: mobile_number })).toString('base64');

    res.json({
      success: true,
      token,
      user: { id: user.id, mobile_number, name: user.name },
    });
  } else {
    res.status(401).json({ error: 'Invalid OTP' });
  }
});

// ============================================
// BILLING ENDPOINTS
// ============================================

// Get bills for user
app.get('/api/bills/:mobile_number', (req, res) => {
  const { mobile_number } = req.params;

  // Read or generate mock bills
  let bills = readDb(dbFiles.bills);
  const userBills = bills.filter(b => b.consumer_mobile === mobile_number);

  if (userBills.length === 0) {
    // Generate mock bills if none exist
    const mockBills = [
      {
        id: uuidv4(),
        consumer_mobile: mobile_number,
        bill_type: 'electricity',
        bill_number: `EL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: 1250,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        consumer_mobile: mobile_number,
        bill_type: 'water',
        bill_number: `WA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: 450,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];
    bills = [...bills, ...mockBills];
    writeDb(dbFiles.bills, bills);
  }

  res.json({
    success: true,
    bills: bills.filter(b => b.consumer_mobile === mobile_number),
  });
});

// Pay bill
app.post('/api/bills/pay', (req, res) => {
  const { bill_id, amount, payment_method, mobile_number } = req.body;

  if (!bill_id || !amount || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transaction = {
    id: uuidv4(),
    bill_id,
    mobile_number,
    amount,
    payment_method,
    status: 'success',
    transaction_ref: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    created_at: new Date().toISOString(),
  };

  let transactions = readDb(dbFiles.transactions);
  transactions.push(transaction);
  writeDb(dbFiles.transactions, transactions);

  // Update bill status
  let bills = readDb(dbFiles.bills);
  const bill = bills.find(b => b.id === bill_id);
  if (bill) {
    bill.status = 'paid';
    bill.paid_at = new Date().toISOString();
    writeDb(dbFiles.bills, bills);
  }

  res.json({
    success: true,
    transaction_id: transaction.id,
    transaction_ref: transaction.transaction_ref,
    amount,
    status: 'success',
  });
});

// ============================================
// COMPLAINT ENDPOINTS
// ============================================

// File complaint
app.post('/api/complaints', (req, res) => {
  const { mobile_number, service_type, description, address, category } = req.body;

  if (!mobile_number || !service_type || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const complaint = {
    id: uuidv4(),
    ticket_number: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    mobile_number,
    service_type,
    category: category || 'general',
    description,
    address: address || 'Not provided',
    status: 'registered',
    priority: 'normal',
    resolution_time_estimate: 3, // days
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    timeline: [
      {
        status: 'registered',
        timestamp: new Date().toISOString(),
        update: 'Your complaint has been registered successfully',
      },
    ],
  };

  let complaints = readDb(dbFiles.complaints);
  complaints.push(complaint);
  writeDb(dbFiles.complaints, complaints);

  res.json({
    success: true,
    complaint_id: complaint.id,
    ticket_number: complaint.ticket_number,
    status: 'registered',
    expected_resolution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
});

// Get complaint status
app.get('/api/complaints/:mobile_number', (req, res) => {
  const { mobile_number } = req.params;
  const complaints = readDb(dbFiles.complaints);
  const userComplaints = complaints.filter(c => c.mobile_number === mobile_number);

  res.json({
    success: true,
    complaints: userComplaints.map(c => ({
      id: c.id,
      ticket_number: c.ticket_number,
      service_type: c.service_type,
      description: c.description,
      status: c.status,
      created_at: c.created_at,
      timeline: c.timeline,
    })),
  });
});

// Get complaint detail
app.get('/api/complaints/detail/:complaint_id', (req, res) => {
  const { complaint_id } = req.params;
  const complaints = readDb(dbFiles.complaints);
  const complaint = complaints.find(c => c.id === complaint_id);

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  res.json({
    success: true,
    complaint,
  });
});

// ============================================
// DOCUMENT ENDPOINTS
// ============================================

// Upload document (mock)
app.post('/api/documents/upload', (req, res) => {
  const { mobile_number, document_type, complaint_id } = req.body;

  if (!mobile_number || !document_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const document = {
    id: uuidv4(),
    mobile_number,
    document_type,
    complaint_id: complaint_id || null,
    file_name: `${document_type}_${Date.now()}.pdf`,
    file_size: Math.floor(Math.random() * 5000000),
    uploaded_at: new Date().toISOString(),
  };

  let documents = readDb(dbFiles.documents);
  documents.push(document);
  writeDb(dbFiles.documents, documents);

  res.json({
    success: true,
    document_id: document.id,
    message: 'Document uploaded successfully',
  });
});

// Get documents
app.get('/api/documents/:mobile_number', (req, res) => {
  const { mobile_number } = req.params;
  const documents = readDb(dbFiles.documents);
  const userDocs = documents.filter(d => d.mobile_number === mobile_number);

  res.json({
    success: true,
    documents: userDocs,
  });
});

// ============================================
// OFFLINE QUEUE ENDPOINTS
// ============================================

// Store offline request
app.post('/api/offline/queue', (req, res) => {
  const { action, data } = req.body;

  if (!action || !data) {
    return res.status(400).json({ error: 'Invalid offline request' });
  }

  const offlineRequest = {
    id: uuidv4(),
    action,
    data,
    status: 'pending',
    created_at: new Date().toISOString(),
    synced_at: null,
  };

  let queue = readDb(dbFiles.offline_queue);
  queue.push(offlineRequest);
  writeDb(dbFiles.offline_queue, queue);

  res.json({
    success: true,
    request_id: offlineRequest.id,
    message: 'Request stored locally. Will sync when connection is restored.',
  });
});

// Sync offline queue
app.post('/api/offline/sync', (req, res) => {
  const queue = readDb(dbFiles.offline_queue);
  const pendingRequests = queue.filter(r => r.status === 'pending');

  // Simulate processing
  let synced = 0;
  pendingRequests.forEach(req => {
    // In production, process each request
    req.status = 'synced';
    req.synced_at = new Date().toISOString();
    synced++;
  });

  writeDb(dbFiles.offline_queue, queue);

  res.json({
    success: true,
    synced_count: synced,
    message: `${synced} offline requests synced successfully`,
  });
});

// Get offline queue status
app.get('/api/offline/status/:mobile_number', (req, res) => {
  const queue = readDb(dbFiles.offline_queue);
  const pending = queue.filter(r => r.status === 'pending');

  res.json({
    success: true,
    offline_queue: pending,
    pending_count: pending.length,
  });
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all complaints (admin)
app.get('/api/admin/complaints', (req, res) => {
  const complaints = readDb(dbFiles.complaints);
  const grouped = {
    registered: complaints.filter(c => c.status === 'registered').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    closed: complaints.filter(c => c.status === 'closed').length,
  };

  res.json({
    success: true,
    total_complaints: complaints.length,
    status_breakdown: grouped,
    recent_complaints: complaints.slice(-10),
  });
});

// Get dashboard analytics (admin)
app.get('/api/admin/analytics', (req, res) => {
  const users = readDb(dbFiles.users);
  const transactions = readDb(dbFiles.transactions);
  const complaints = readDb(dbFiles.complaints);
  const bills = readDb(dbFiles.bills);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const paidBills = bills.filter(b => b.status === 'paid').length;

  res.json({
    success: true,
    analytics: {
      total_users: users.length,
      total_transactions: transactions.length,
      total_complaints: complaints.length,
      total_revenue: totalRevenue,
      paid_bills: paidBills,
      pending_bills: bills.filter(b => b.status === 'pending').length,
      kiosk_usage: {
        this_week: Math.floor(Math.random() * 500),
        this_month: Math.floor(Math.random() * 2000),
      },
    },
  });
});

// Update complaint status (admin)
app.patch('/api/admin/complaints/:complaint_id', (req, res) => {
  const { complaint_id } = req.params;
  const { status, update_message } = req.body;

  const complaints = readDb(dbFiles.complaints);
  const complaint = complaints.find(c => c.id === complaint_id);

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  complaint.status = status;
  complaint.updated_at = new Date().toISOString();
  complaint.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    update: update_message || `Status updated to ${status}`,
  });

  writeDb(dbFiles.complaints, complaints);

  res.json({
    success: true,
    complaint,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ JanSetu SUVIDHA Backend running on http://localhost:${PORT}`);
  console.log(`✓ Database directory: ${dbDir}`);
});
