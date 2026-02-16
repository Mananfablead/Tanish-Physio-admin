# Credentials Management System - Integration Complete ✅

## What's Been Completed

### Backend Setup
✅ **Models** - `Credentials.model.js` - MongoDB schema with AES-256 encryption  
✅ **Controllers** - `credentials.controller.js` - Full CRUD operations  
✅ **Routes** - `credentials.routes.js` - API endpoints with admin role protection  
✅ **Utilities** - `credentialsManager.js` - Helper functions to retrieve credentials  
✅ **Routes Index** - Updated `/src/routes/index.js` to include credentials routes  

### Frontend Setup
✅ **Admin Page** - `AdminCredentials.tsx` - Complete UI for managing credentials  
✅ **Routing** - Added `/credentials` route in `App.tsx`  
✅ **Navigation** - Added "Credentials" menu item to admin sidebar  

### Documentation
✅ **Developer Guide** - `CREDENTIALS_MANAGEMENT.md`  
✅ **Admin Setup Guide** - `ADMIN_CREDENTIALS_SETUP.md`  

## Quick Start

### 1. Ensure Backend Environment Variables

Add to your `.env` file in the backend:

```env
# Database (already existing)
MONGODB_URI=your_mongodb_uri

# Credentials Encryption Key (ADD THIS)
CIPHER_KEY=your-32-character-secret-key-1234567890

# Other existing variables...
```

### 2. Start Your Servers

**Backend Terminal:**
```bash
cd Tanish-Video-Physio-Backend
npm run dev
```

**Admin Frontend Terminal:**
```bash
cd Tanish-Physio-admin
npm run dev
```

### 3. Access the Credentials Page

1. Log in to your admin dashboard
2. Look for **Credentials** in the left sidebar (with a key icon 🔑)
3. Click on it to open the Credentials Management page

## Features Available

### WhatsApp Management
- Add multiple WhatsApp Business API credentials
- Store: Access Token, Phone Number ID, Business ID
- Activate/Deactivate credentials
- All data encrypted in database

### Email Configuration
- Add SMTP email configurations (Gmail, Outlook, etc.)
- Store: Host, Port, Email, Password, Admin Email
- Activate/Deactivate credentials
- Validate SMTP connection

### Razorpay Setup
- Add Razorpay payment credentials
- Store: Key ID, Key Secret
- Support for both test and live keys
- Activate/Deactivate credentials

## API Endpoints

All endpoints are protected (require authentication + admin role):

```
GET    /api/credentials              - Get all credentials
POST   /api/credentials              - Create credential
GET    /api/credentials/:id          - Get single credential
PUT    /api/credentials/:id          - Update credential
DELETE /api/credentials/:id          - Delete credential
PATCH  /api/credentials/:id/toggle-status - Activate/Deactivate
POST   /api/credentials/:id/validate - Validate credential
GET    /api/credentials/type/:type   - Get active by type
```

## Using Credentials in Your Code

### Example: Send Email Using Stored Credentials

```javascript
const { getEmailCredentials } = require("../utils/credentialsManager");
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  try {
    const emailCreds = await getEmailCredentials();
    
    if (!emailCreds) {
      throw new Error("Email credentials not configured");
    }

    const transporter = nodemailer.createTransport({
      host: emailCreds.host,
      port: emailCreds.port,
      secure: true,
      auth: {
        user: emailCreds.user,
        pass: emailCreds.password
      }
    });

    const result = await transporter.sendMail({
      from: emailCreds.user,
      to,
      subject,
      html
    });

    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}
```

### Example: Use WhatsApp Credentials

```javascript
const { getWhatsAppCredentials } = require("../utils/credentialsManager");
const axios = require("axios");

async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const whatsappCreds = await getWhatsAppCredentials();
    
    if (!whatsappCreds) {
      throw new Error("WhatsApp credentials not configured");
    }

    const response = await axios.post(
      `https://graph.instagram.com/v17.0/${whatsappCreds.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${whatsappCreds.accessToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("WhatsApp message failed:", error);
    throw error;
  }
}
```

### Example: Use Razorpay Credentials

```javascript
const { getRazorpayCredentials } = require("../utils/credentialsManager");
const Razorpay = require("razorpay");

async function createRazorpayOrder(amount, currency = "INR") {
  try {
    const razorpayCreds = await getRazorpayCredentials();
    
    if (!razorpayCreds) {
      throw new Error("Razorpay credentials not configured");
    }

    const razorpayInstance = new Razorpay({
      key_id: razorpayCreds.keyId,
      key_secret: razorpayCreds.keySecret
    });

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`
    });

    return order;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw error;
  }
}
```

## Security Best Practices

### ✅ DO:
- Use app-specific passwords for email (not your main password)
- Rotate credentials regularly
- Keep CIPHER_KEY in .env and never commit it
- Use different credentials for test vs production
- Validate credentials before saving

### ❌ DON'T:
- Share credentials via email or chat
- Hardcode credentials in source code
- Use the same password for multiple services
- Log credential values
- Commit .env files to version control

## Database Structure

Credentials are stored in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,
  credentialType: "whatsapp" | "email" | "razorpay",
  name: "Credential Name",
  description: "Optional description",
  
  // WhatsApp Fields (encrypted)
  whatsappAccessToken: "encrypted_value",
  whatsappPhoneNumberId: "encrypted_value",
  whatsappBusinessId: "encrypted_value",
  
  // Email Fields (encrypted)
  emailHost: "encrypted_value",
  emailPort: 587,
  emailUser: "encrypted_value",
  emailPassword: "encrypted_value",
  adminEmail: "encrypted_value",
  
  // Razorpay Fields (encrypted)
  razorpayKeyId: "encrypted_value",
  razorpayKeySecret: "encrypted_value",
  
  // Metadata
  isActive: true | false,
  lastUpdatedBy: ObjectId (User),
  lastUpdatedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### "Failed to load credentials" on frontend
- Check if backend is running
- Verify user is logged in as admin
- Check browser console for detailed errors

### "Credentials not saving"
- Ensure all required fields are filled
- Check MongoDB connection
- Verify CIPHER_KEY is set in .env

### "Failed to retrieve credentials" in code
- Check if credential is marked as Active
- Verify MongoDB has the credentials collection
- Check database connectivity

### Encryption/Decryption errors
- Verify CIPHER_KEY length is 32 characters
- Ensure CIPHER_KEY hasn't changed (would break decryption)
- Check if credentials were corrupted in database

## Migration from Environment Variables

To migrate existing credentials from `.env` to this system:

### Step 1: Add credentials via Admin Panel
Go to Credentials Management page and manually add your credentials

### Step 2: Update code
Replace environment variable usage with credentialsManager utility

**Before:**
```javascript
const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
```

**After:**
```javascript
const { getWhatsAppCredentials } = require("../utils/credentialsManager");
const creds = await getWhatsAppCredentials();
const whatsappToken = creds.accessToken;
```

### Step 3: Remove from .env
Once migrated, remove sensitive credentials from `.env`

## File Locations

### Backend Files
```
src/
  ├── models/
  │   └── Credentials.model.js          ✅ CREATED
  ├── controllers/
  │   └── credentials.controller.js     ✅ CREATED
  ├── routes/
  │   ├── credentials.routes.js         ✅ CREATED
  │   └── index.js                      ✅ UPDATED (added credentials route)
  └── utils/
      └── credentialsManager.js         ✅ CREATED
```

### Frontend Files
```
src/
  ├── pages/
  │   └── AdminCredentials.tsx          ✅ UPDATED (fully functional)
  ├── components/layout/
  │   └── AdminSidebar.tsx              ✅ UPDATED (added nav link)
  └── App.tsx                           ✅ UPDATED (added route)
```

### Documentation
```
├── CREDENTIALS_MANAGEMENT.md           ✅ CREATED (development guide)
└── ADMIN_CREDENTIALS_SETUP.md          ✅ CREATED (admin guide)
```

## Next Steps

1. **Test the system** - Add a test credential and verify it works
2. **Integrate with services** - Use credentialsManager utilities in your code
3. **Migrate credentials** - Move from .env to this system
4. **Set up monitoring** - Log credential usage for audit trails
5. **Plan rotation** - Implement credential rotation schedules

## Support & Questions

For issues or questions:
1. Check the documentation files
2. Review the code comments in the created files
3. Check browser console and server logs for errors
4. Verify all required fields are properly configured

---

**System Status**: ✅ Ready to use  
**Last Updated**: February 16, 2026  
**Version**: 1.0.0
