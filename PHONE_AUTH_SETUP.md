# Firebase Phone Authentication Setup Guide

## Overview
This project now includes Firebase phone number authentication with SMS verification. Users can sign in using their phone number with OTP verification.

## Features Implemented

### 1. Phone Authentication Functions (`src/lib/auth.ts`)
- `initializeRecaptcha()` - Sets up invisible reCAPTCHA for spam protection
- `sendSMSVerificationCode()` - Sends SMS verification code to phone number
- `verifyPhoneNumber()` - Verifies the OTP code and completes login
- `linkPhoneNumber()` - Links phone number to existing account
- `formatPhoneNumber()` - Utility function for phone number formatting
- `clearRecaptcha()` - Cleanup function for reCAPTCHA

### 2. Phone Login Component (`src/pages/auth/PhoneLogin.tsx`)
- **Two-step process**: Phone number entry → OTP verification
- **reCAPTCHA integration**: Invisible reCAPTCHA for spam protection
- **Phone number formatting**: Auto-formats with country code (+91 default for India)
- **OTP verification**: 6-digit code input with auto-formatting
- **Resend functionality**: 60-second countdown for code resend
- **Error handling**: Comprehensive error messages and states
- **Responsive design**: Mobile-first design with animations

### 3. Navigation Integration
- **Login page updated**: Added "Sign in with Phone" button
- **Router updated**: New route `/auth/phone-login`
- **Consistent design**: Matches existing auth page styling

## Firebase Console Setup Required

### 1. Enable Phone Authentication
1. Go to [Firebase Console for your project](https://console.firebase.google.com/project/avrlodgev2/authentication/providers)
2. Navigate to **Authentication** → **Sign-in method**
3. Click **Phone** in the list of providers
4. Click **Enable** toggle
5. Click **Save**
6. Verify these domains are in **Authorized domains**:
   - `localhost` (for development)
   - Your production domain (when deploying)

### 2. Test Phone Numbers (Development)
For testing without SMS charges:
1. In Firebase Console → Authentication → Sign-in method
2. Scroll to **Phone numbers for testing**
3. Add test numbers like:
   - Phone: `+91 98765 43210`
   - Code: `123456`

### 3. Production Setup
For production deployment:
1. Verify your domain is in authorized domains
2. Set up proper reCAPTCHA keys if needed
3. Consider SMS quota limits

## How to Use

### 1. Access Phone Login
- Visit: `http://localhost:3005/auth/phone-login`
- Or click "Sign in with Phone" on login page

### 2. Phone Number Entry
- Enter phone number with country code (e.g., `+91 98765 43210`)
- Default country code is +91 (India)
- Click "Send Code"

### 3. OTP Verification
- Enter the 6-digit code received via SMS
- Code input auto-formats and validates
- Click "Verify Code" to complete login

### 4. Account Integration
- First-time users: New account created automatically
- Existing users: Links to existing account if phone number matches
- User document created in Firestore with default role: `guest`

## Security Features

### 1. reCAPTCHA Protection
- Invisible reCAPTCHA prevents spam and abuse
- Automatically triggers before SMS sending
- Cleans up properly on component unmount

### 2. Rate Limiting
- 60-second cooldown between resend attempts
- Firebase built-in SMS rate limiting
- Client-side validation for phone number format

### 3. Input Validation
- Phone number format validation
- OTP code length validation (6 digits)
- Country code auto-formatting

## Error Handling

### Common Error Scenarios
1. **Invalid phone number**: Format validation with helpful messages
2. **reCAPTCHA failure**: Automatic retry with user feedback
3. **SMS delivery failure**: Clear error message with retry option
4. **Invalid OTP**: Real-time validation with retry
5. **Network issues**: Timeout handling and retry mechanisms

### Error Messages
- "Please enter your phone number"
- "Failed to send verification code"
- "Invalid verification code"
- "reCAPTCHA verification failed"

## Testing

### 1. Development Testing
```bash
# Start development server
npm run dev

# Navigate to phone login
http://localhost:3005/auth/phone-login
```

### 2. Test Phone Numbers
Use Firebase test numbers for development:
- Phone: `+91 98765 43210`
- Code: `123456`

### 3. Production Testing
1. Test with real phone numbers
2. Verify SMS delivery
3. Test different country codes
4. Verify user account creation

## Integration with Existing Auth

### 1. User Documents
- Phone-authenticated users get same Firestore structure
- Default role: `guest`
- Can be promoted to `manager` or `admin` by admin users

### 2. Role-Based Routing
- Phone-authenticated users follow same redirect logic
- Guests → Home page
- Managers → Manager dashboard
- Admins → Admin dashboard

### 3. Account Linking
- Users can link phone number to existing email account
- Preserves existing user data and roles
- Provides multiple sign-in options

## API Reference

### Phone Authentication Functions

```typescript
// Initialize reCAPTCHA
const recaptchaVerifier = initializeRecaptcha('recaptcha-container');

// Send SMS verification code
const confirmationResult = await sendSMSVerificationCode('+919876543210', recaptchaVerifier);

// Verify OTP code
const userCredential = await verifyPhoneNumber(confirmationResult, '123456');

// Format phone number
const formatted = formatPhoneNumber('9876543210', '+91'); // Returns: +919876543210

// Cleanup
clearRecaptcha();
```

### Component Props

```typescript
// PhoneLoginPage - No props required
<PhoneLoginPage />
```

## Troubleshooting

### 1. reCAPTCHA Issues
- Ensure domain is authorized in Firebase Console
- Check browser console for reCAPTCHA errors
- Verify internet connection

### 2. SMS Not Received
- Check phone number format
- Verify country code
- Use test numbers for development
- Check Firebase quota limits

### 3. Build Errors
- Ensure all Firebase auth imports are correct
- Check TypeScript types
- Verify environment variables

### 4. Navigation Issues
- Check router configuration
- Verify route paths match exactly
- Clear browser cache if needed

## Future Enhancements

### Potential Improvements
1. **Multi-country support**: Country code selector
2. **Phone number verification**: Link existing accounts
3. **SMS provider options**: Custom SMS service integration
4. **Enhanced validation**: Phone number format by country
5. **Accessibility**: Screen reader support and keyboard navigation

### Security Enhancements
1. **Rate limiting**: Server-side SMS limits
2. **Phone verification**: Two-factor authentication
3. **Fraud detection**: Suspicious activity monitoring
4. **Audit logging**: Phone auth attempt tracking

This implementation provides a solid foundation for phone number authentication that integrates seamlessly with your existing Firebase auth system.