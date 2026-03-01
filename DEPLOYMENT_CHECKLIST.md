# DEPLOYMENT CHECKLIST FOR SMART CITY ROLL-OUT

## Pre-Deployment Verification

### System Requirements ✓
- [x] Kiosk Hardware: Touchscreen 24"+, 4GB RAM minimum
- [x] OS: Windows 10/macOS/Linux with Node.js 16+
- [x] Network: Ethernet + WiFi redundancy
- [x] Power: UPS backup (minimum 4 hours)
- [x] Printer: Receipt thermal printer (optional but recommended)

### Software Configuration ✓
- [x] Install Node.js 16+
- [x] Clone/download JanSetu SUVIDHA project
- [x] Install dependencies: `npm install` (both frontend & backend)
- [x] Configure .env file with municipality details
- [x] Set API endpoints and payment gateway (if live)
- [x] Configure SMS/Email providers for OTP delivery

### Security Setup ✓
- [x] Generate JWT secret: `openssl rand -hex 32`
- [x] Enable HTTPS certificate
- [x] Configure firewall rules
- [x] Set strong admin passwords
- [x] Enable auto-backup of data directory
- [x] Test offline mode sync recovery

---

## Testing Phase (Test Account)

### Functional Testing
- [ ] Login with OTP (9876543210 - test number)
- [ ] Bill payment flow (Electricity + Water)
- [ ] Complaint registration (all categories)
- [ ] Document upload (all types)
- [ ] Status tracking with timeline
- [ ] Language switching (all 6 languages)
- [ ] Accessibility mode (large text)
- [ ] Admin dashboard access

### User Experience Testing
- [ ] First-time users can complete payment without assistance
- [ ] Instructions are clear in all languages
- [ ] Buttons are easily clickable on touchscreen
- [ ] Response times acceptable (< 2 seconds)
- [ ] Error messages helpful and clear
- [ ] Receipt printing works

### Offline Testing
- [ ] Disconnect internet
- [ ] Register complaint offline
- [ ] Data saved in localStorage
- [ ] Reconnect internet
- [ ] Verify auto-sync happens
- [ ] Check admin sees synced data

### Performance Testing
- [ ] 50 concurrent users (load test)
- [ ] Bill payment under load
- [ ] Admin dashboard responsive with 1000+ complaints
- [ ] Database queries < 1 second
- [ ] No memory leaks (monitor RAM)

### Security Testing
- [ ] OTP cannot be reused
- [ ] SQL injection impossible (JSON backend)
- [ ] XSS protection working
- [ ] CSRF tokens validated
- [ ] Session timeout working
- [ ] Admin authentication required

---

## Production Deployment

### 1. Hardware Setup
```bash
# Verify kiosk meets specs
$ node --version          # v16.0.0+
$ npm --version          # 8.0.0+
$ free -m                # 4GB+ RAM available
$ df -h                  # Storage space adequate
```

### 2. Database Preparation
```bash
# Backup any existing data
cp -r backend/data backend/data.backup.$(date +%s)

# Initialize fresh database
mkdir -p backend/data
# Database files auto-create on first run
```

### 3. Start Services (Production)
```bash
# Using PM2 for process management
npm install -g pm2

# Backend
cd backend
pm2 start server.js --name jansetu-api
pm2 startup
pm2 save

# Frontend (via nginx reverse proxy)
cd ../frontend
npm run build
# Deploy dist/ folder to web server
```

### 4. Nginx Configuration (Recommended)
```nginx
# /etc/nginx/sites-available/jansetu

upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name jansetu.municipal.gov.in;
    
    # Frontend
    location / {
        root /var/www/jansetu/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # SSL
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### 5. Monitoring Setup
```bash
# Install monitoring tools
npm install -g pm2-monitoring

# Monitor in real-time
pm2 web            # Web dashboard on port 9615
pm2 monitor        # Monitor processes

# Check logs
pm2 logs jansetu-api
pm2 logs jansetu-frontend
```

### 6. Backup Configuration
```bash
# Daily backup script
cat > /usr/local/bin/jansetu-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/backups/jansetu
mkdir -p $BACKUP_DIR
cp -r /home/jansetu/setu/backend/data $BACKUP_DIR/data-$(date +%s)
# Keep last 30 days
find $BACKUP_DIR -type d -name "data-*" -mtime +30 -exec rm -rf {} \;
EOF

# Make executable
chmod +x /usr/local/bin/jansetu-backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/jansetu-backup.sh" | crontab -
```

---

## Post-Deployment Validation

### Data Integrity
- [ ] Sample users created
- [ ] Sample bills generated
- [ ] Admin can view analytics
- [ ] Complaints properly stored
- [ ] Offline queue syncing
- [ ] Backup files created

### User Acceptance Testing (UAT)
- [ ] Municipality admin tested
- [ ] Test users completed workflows
- [ ] All 6 languages verified
- [ ] Accessibility mode tested
- [ ] Complaint tracking working
- [ ] Receipt printing verified

### Performance Validation
- [ ] Load time < 2 seconds
- [ ] Payment processing < 5 seconds
- [ ] Complaint registration < 7 seconds
- [ ] Admin dashboard loads < 3 seconds
- [ ] No errors in console

### Live Monitoring
- [ ] System uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] Average response time tracked
- [ ] Daily active users monitored
- [ ] Complaint resolution rate tracked

---

## Operational Handover

### Documentation Provided
- [x] OPERATOR_GUIDE.md (for kiosk operators)
- [x] README.md (complete technical guide)
- [x] API documentation
- [x] Admin panel user guide
- [x] Troubleshooting guide

### Training Provided
- [ ] Kiosk operator training (4 hours)
  - [ ] Daily startup/shutdown
  - [ ] User assistance
  - [ ] Basic troubleshooting
  - [ ] Complaint resolution
  
- [ ] Administrator training (8 hours)
  - [ ] System monitoring
  - [ ] User management
  - [ ] Complaint processing
  - [ ] Backup procedures
  - [ ] Security protocols

- [ ] IT Support training (16 hours)
  - [ ] System architecture
  - [ ] Database management
  - [ ] API integration
  - [ ] Deployment procedures
  - [ ] Emergency recovery

### Support Plan
- [ ] 24/7 helpline: 1800-JANSETU
- [ ] Email support: support@jansetu.gov.in
- [ ] Remote access for troubleshooting
- [ ] Monthly performance review
- [ ] Quarterly security audit

---

## Phase 2 Integrations (Post-Launch)

### Payment Gateway Integration
```javascript
// Example: Razorpay integration
const razorpay = require('razorpay');
const client = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/bills/pay-real', async (req, res) => {
  const order = await client.orders.create({
    amount: req.body.amount * 100,
    currency: 'INR',
    receipt: req.body.bill_id
  });
  res.json({ order_id: order.id });
});
```

### SMS Integration
```javascript
// Example: AWS SNS for OTP delivery
const sns = new AWS.SNS();

const sendOTP = (mobileNumber, otp) => {
  return sns.publish({
    Message: `Your JanSetu SUVIDHA OTP is: ${otp}`,
    PhoneNumber: `+91${mobileNumber}`
  }).promise();
};
```

### Real Database Integration
```javascript
// Replace JSON with PostgreSQL
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Use existing queries with pool
const result = await pool.query('SELECT * FROM bills WHERE consumer_id = $1', [userId]);
```

---

## Maintenance Schedule

### Daily
- [ ] Check system uptime
- [ ] Review error logs
- [ ] Verify kiosk is responsive
- [ ] Check offline queue status

### Weekly
- [ ] Backup user data
- [ ] Review complaint resolutions
- [ ] Check payment success rate
- [ ] Monitor resource usage

### Monthly
- [ ] Security audit
- [ ] Performance analysis
- [ ] User feedback review
- [ ] Update documentation

### Quarterly
- [ ] Penetration testing
- [ ] Database optimization
- [ ] Dependency updates
- [ ] Capacity planning

### Annually
- [ ] Complete security audit
- [ ] Disaster recovery drill
- [ ] Service SLA review
- [ ] Strategic improvements

---

## Success Metrics (KPIs)

| Metric | Target | Frequency |
|--------|--------|-----------|
| System Uptime | > 99.5% | Monthly |
| Avg Response Time | < 2 seconds | Daily |
| Bill Payment Success | > 98% | Monthly |
| Complaint Resolution | < 5 days | Monthly |
| User Satisfaction | > 4.2/5 | Quarterly |
| Daily Active Users | Growth trend | Weekly |
| Offline Sync Rate | > 99% | Weekly |
| Admin Action Time | < 1 hour | Monthly |

---

## Escalation Contacts

### Level 1: Technical Support
- Platform Issue: tech-support@jansetu.gov.in
- Response Time: 1 hour

### Level 2: System Administrator  
- Configuration/Integration: sysadmin@jansetu.gov.in
- Response Time: 2 hours

### Level 3: Architecture/Security
- Major Issues: chief-architect@jansetu.gov.in
- Response Time: 30 minutes

### Emergency (Downtime)
- 24/7 On-call: +91-XXX-XXXX-XXXX
- Response Time: 15 minutes

---

**Deployment Status**: Ready for Production  
**Last Updated**: 27 February 2026  
**Version**: 1.0  
**Approved by**: C-DAC SUVIDHA 2026 Team
