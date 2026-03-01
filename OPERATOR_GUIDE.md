# KIOSK OPERATOR QUICK REFERENCE

## 🎯 Starting the Kiosk System

### Prerequisites Checklist
- [ ] Node.js 16+ installed
- [ ] Admin has backend and frontend terminals open
- [ ] Internet connection available (or offline mode ready)
- [ ] Kiosk display is clean and visible

### Morning Startup (5 minutes)

```
Terminal 1 - Backend:
$ cd backend
$ npm start
(Wait for: "✓ JanSetu SUVIDHA Backend running")

Terminal 2 - Frontend:
$ cd frontend
$ npm run dev
(Wait for: "Local: http://localhost:5173")

Access: http://localhost:5173
```

---

## 👤 User Walkthrough

### Step 1: Welcome Screen (30 seconds)
1. **Language Selection** → Choose from 6 languages
2. **Accessibility Mode** → Normal or Large Text
3. Click **"Let's Get Started"**

### Step 2: Authentication (1 minute)
1. User enters **10-digit mobile number**
   - Example: 9876543210
   - System shows OTP on screen (IMPORTANT: Show to user!)
2. User can copy OTP or read it aloud
3. Click **"Verify OTP"**
4. Shows dashboard

### Step 3: Select Service
- **💳 Pay Bills** → Electricity, water
- **📋 Report Issue** → Complaint about civic service
- **📍 Track Status** → Check complaint progress
- **📄 Upload Docs** → Upload Aadhar, ID, proofs

---

## 💳 Billing Service Flow

### Customer wants to pay electricity bill

```
Dashboard → Click "Pay Bills"
           ↓
Select Bill Card (₹ amount shown)
           ↓
Select Payment Method (UPI/Card/Cash)
           ↓
Confirm Payment
           ↓
SUCCESS → Reference ID shown
           ↓
Print Receipt (if printer available)
```

**Operator Notes:**
- Bills are auto-generated for demo (Electricity ₹1,250 + Water ₹450)
- In production: Real bills loaded from billing system
- Reference ID can be used for payment tracking

---

## 📋 Complaint Registration Flow

### Customer reports water not coming

```
Dashboard → Click "Report Issue"
           ↓
Select Category (Water Supply, Electricity, Streetlight, etc.)
           ↓
Describe Problem (Text field)
           ↓
Enter Location (Optional)
           ↓
SUBMIT
           ↓
SUCCESS → Ticket Number shown (e.g., TKT-2026279-ABC)
           ↓
Can click "Track Status" to see timeline
```

**Operator Notes:**
- Encourage customer to note the ticket number
- Can take photo with camera attachment (in production)
- Status will auto-update when admin processes it

---

## 📍 Complaint Status Tracking

### Customer wants to check complaint status

```
Dashboard → Click "Track Status"
           ↓
Shows list of all customer's complaints
           ↓
Click complaint to see full details:
  - Ticket number
  - Category
  - Current status (Registered/In Progress/Resolved)
  - Timeline with dates and updates
           ↓
Can print timeline for records
```

**Operator Notes:**
- Timeline shows every status change with timestamps
- Admin updates status from Admin Dashboard
- Customer can check anytime with their mobile number

---

## 📄 Document Upload

### Customer uploads Aadhar card

```
Dashboard → Click "Upload Documents"
           ↓
Select Document Type (Aadhar/ID/Address Proof/Bill)
           ↓
Click upload area or select file
           ↓
SUCCESS → Document ID shown
           ↓
Can upload more or return to dashboard
```

**Operator Notes:**
- In demo: Simulates file upload (any file works)
- In production: Scans actual documents via camera/scanner
- Documents linked to user account and complaints

---

## 🛠️ Operator Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
1. Check Terminal 1 - Backend running?
2. Check if port 5000 is available: `lsof -i :5000`
3. Restart backend: Press Ctrl+C, then `npm start`

### Issue: "Frontend won't load / Error on screen"
**Solution:**
1. Check browser console (F12)
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Clear cache: Empty browser cache
4. Restart frontend: Ctrl+C in Terminal 2, then `npm run dev`

### Issue: "Offline Mode - Requests will sync when connected"
**Normal:** System continues to work offline!
1. User can still register complaints locally
2. Pay bills (simulated, stored locally)
3. System auto-syncs when connection back
4. Check admin panel for pending offline items

### Issue: "User can't see OTP after clicking Request"
**Solution:**
1. OTP displayed on **same screen** near input field (yellow box)
2. Tell user to read the yellow box below input
3. Read OTP aloud if needed
4. In accessibility mode: Larger text makes it clearer

### Issue: "Mobile number showing error"
**Allow/Block Numbers:**
- Accept: Any 10 digits (0000000000 to 9999999999)
- Block: Less than 10 digits, non-numeric characters
- Example valid: 9876543210, 9000000001, 8765432109

---

## 📊 Admin Dashboard Access

### Check System Health

```
On Kiosk Screen → Bottom Right Corner
                → Look for "Admin" text/button
                → (In production: PIN-protected)
                
Shows:
- Total users registered
- Total bill payments made
- Total complaints filed (by status)
- Total revenue collected
- Weekly/monthly kiosk usage
- Recent complaints list
```

### Update Complaint Status

```
Admin Dashboard → Go to "Complaints" tab
                → See recent complaints table
                → In production: Click pencil to edit
                → Change status: Registered → In Progress → Resolved
                → Status updates immediately in user's tracking
```

---

## 🌐 Language Support

| Language | Code | Usage |
|----------|------|-------|
| English | en | Default |
| हिन्दी | hi | Northern India |
| தமிழ் | ta | Tamil Nadu |
| తెలుగు | te | Telangana, AP |
| ಕನ್ನಡ | ka | Karnataka |
| മലയാളം | ml | Kerala |

**How to Switch:**
1. Welcome screen - Click desired language
2. System remembers choice for session
3. To change mid-session: Logout and login again

---

## ♿ Accessibility Features

### Large Text Mode Benefits
- **Font**: 18px (vs. 14px normal)
- **Buttons**: 80px tall (vs. 48px normal)
- **Colors**: High contrast (dark text on light)
- **Spacing**: More breathing room

### Who Should Use it?
✓ Elderly citizens (60+)  
✓ Vision impaired (with screen reader)  
✓ First-time users (less overwhelming)  

### Enable:
1. Welcome screen → Choose "Large Text Mode"
2. Or keyboard: Press tab to focus, enter to activate

---

## 📱 Common Citizen Questions

**Q: Do I need an account?**
A: No! Just your mobile number and OTP. System auto-creates account.

**Q: Is it free?**
A: Kiosk access is free. Bill payments use standard rates (no extra charge).

**Q: Can I use any mobile number?**
A: Yes, any 10-digit Indian mobile number works for demo.

**Q: What if I lose my ticket number?**
A: Track Status by mobile number. Ticket number shown again.

**Q: Can I pay with cash?**
A: Yes! Choose "Cash at Counter" option. Collector will assist.

**Q: Is my data safe?**
A: Yes. Mobile-based OTP, encrypted storage, government server.

**Q: How long does complaint resolution take?**
A: Typically 3-5 days. Timeline updated live on kiosk.

---

## 📞 Support Contacts

**System Issues**: support@jansetu.gov.in  
**Citizen Helpline**: 1800-JANSETU  
**Admin Support**: +91-XXX-XXXX-XXXX  

---

## ⚠️ Important Notes

1. **Demo Data**: Bills and users are auto-generated. Not real data.
2. **Payments**: Simulated in demo. Real integration in production.
3. **Storage**: All data in JSON files in `backend/data/` folder
4. **Backup**: Copy `backend/data/` periodically
5. **Security**: Add password protection to Admin panel in production

---

**Last Updated**: 27 February 2026  
**Version**: 1.0  
**Status**: Production-Ready Prototype
