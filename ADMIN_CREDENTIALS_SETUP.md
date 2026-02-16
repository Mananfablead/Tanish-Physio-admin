# Admin Credentials Setup Guide

## Overview

This guide will help you set up and manage credentials for WhatsApp, Email, and Razorpay through the admin dashboard.

## How to Access

1. Log in to the admin dashboard with your admin credentials
2. Navigate to **Credentials Management** (or similar menu item)
3. Select the tab for the service you want to configure (WhatsApp, Email, or Razorpay)

## WhatsApp Setup

### Get Your WhatsApp Credentials

1. Visit [Facebook Business Manager](https://business.facebook.com)
2. Go to **Apps & Assets > Apps**
3. Select your WhatsApp Business App
4. Navigate to **Settings > API Setup**
5. Copy the following:
   - **Access Token** - Temporary or Permanent Token
   - **Phone Number ID** - Your WhatsApp Business phone number ID
   - **Business ID** - Your WhatsApp Business Account ID

### In Admin Dashboard

1. Go to the **WhatsApp** tab
2. Fill in the form:
   - **Credential Name**: Give it a descriptive name (e.g., "WhatsApp Production")
   - **Description**: Optional notes about this credential
   - **Access Token**: Paste your WhatsApp access token
   - **Phone Number ID**: Paste your phone number ID
   - **Business ID**: Paste your business ID
3. Click **Add Credential**
4. Your credential will be listed below. Only one WhatsApp credential can be active at a time.

### Activating/Deactivating

- Click **Activate** to use this credential for WhatsApp API calls
- Click **Deactivate** if you want to disable it temporarily
- Only one credential per type can be active

## Email Setup

### Get Your Email Credentials

#### For Gmail with App Password:
1. Enable 2-Step Verification on your Google Account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Click **App passwords**
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a 16-character password
6. Copy this password (remove spaces)

#### For Other SMTP Providers:
1. Log in to your email provider's admin panel
2. Find SMTP settings or email configuration
3. Copy:
   - SMTP Host (e.g., smtp.gmail.com)
   - SMTP Port (usually 587 or 465)
   - Username/Email
   - Password or App Password
   - From Address (admin email)

### In Admin Dashboard

1. Go to the **Email** tab
2. Fill in the form:
   - **Credential Name**: e.g., "Gmail SMTP"
   - **Description**: Optional notes
   - **SMTP Host**: e.g., `smtp.gmail.com`
   - **SMTP Port**: e.g., `587`
   - **Email Address**: Your email account
   - **Password**: App password (for Gmail) or regular password
   - **Admin Email**: Email address for receiving notifications
3. Click **Add Credential**

### Testing Email Credentials

After saving, you should test the credentials to ensure they work:
1. Look for a **Validate** or **Test** button next to the credential
2. This will verify the SMTP connection

## Razorpay Setup

### Get Your Razorpay Credentials

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings > API Keys**
3. You'll see two keys:
   - **Key ID** - Your public key (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** - Your private key (keep this confidential!)

### Important Notes for Razorpay

- **Test vs. Live Keys**: Always start with test keys. Switch to live keys only for production
- **Webhook Integration**: After setting up Razorpay credentials, you may need to configure webhooks
- **Security**: Never share your Key Secret. Treat it like a password.

### In Admin Dashboard

1. Go to the **Razorpay** tab
2. Fill in the form:
   - **Credential Name**: e.g., "Razorpay Live" or "Razorpay Test"
   - **Description**: e.g., "Production payment credentials" or "Testing"
   - **Key ID**: Paste your Key ID
   - **Key Secret**: Paste your Key Secret
3. Click **Add Credential**

## Managing Credentials

### Edit a Credential

1. Find the credential in the list below the form
2. Click the **Edit** button
3. Update any fields
4. Click **Update Credential**

### Delete a Credential

1. Find the credential in the list
2. Click the **Delete** button (trash icon)
3. Confirm the deletion

### Activate/Deactivate

1. Find the credential in the list
2. Click **Activate** to use it, or **Deactivate** to disable it
3. Only one credential per type can be active

## Best Practices

### Security

✅ **Do:**
- Use app-specific passwords (not your actual account password)
- Regularly rotate credentials
- Keep credentials in the secure database (not in .env files)
- Use different credentials for test vs. production

❌ **Don't:**
- Share credentials via email or chat
- Hardcode credentials in application code
- Use the same password for multiple services
- Store plain text credentials anywhere

### Organization

- Use descriptive credential names (include environment, date, purpose)
- Add descriptions explaining what each credential is for
- Document any special configurations or limitations

## Troubleshooting

### "Credential not saved" / "Failed to save"

- Verify all required fields are filled in (marked with *)
- Check your internet connection
- Ensure you're logged in as an admin user
- Check browser console for error messages

### "Email/WhatsApp not working"

- Verify the credentials are marked as **Active**
- Test the credentials using the validation function (if available)
- Check that all required fields match your service provider's settings
- For Gmail: Ensure you're using an app password, not your regular password
- For WhatsApp: Verify the access token hasn't expired

### "Multiple credentials showing but only one should be active"

- Each service type (WhatsApp, Email, Razorpay) can have multiple credentials
- However, only ONE should be marked as **Active** per service
- Click **Deactivate** on the others to ensure only one is active

## Support

If you encounter issues:

1. **Check the error message** - It often tells you what's wrong
2. **Verify all fields** - Ensure you've copied them exactly from your service provider
3. **Test with your service provider** - Verify the credentials work with their platform
4. **Contact support** - Reach out to the development team with:
   - The service type (WhatsApp/Email/Razorpay)
   - What error message you see
   - What steps you've already tried

---

**Last Updated**: February 16, 2026
**System Version**: 1.0.0
