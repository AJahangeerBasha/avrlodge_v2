# Vercel Deployment Guide - AVR Lodge v2

## 🚀 Quick Deployment Steps

### 1. **Install Vercel CLI (Optional)**
```bash
npm install -g vercel
```

### 2. **Push Code to GitHub**
```bash
git add .
git commit -m "Deploy: Ready for Vercel deployment"
git push origin main
```

### 3. **Deploy via Vercel Dashboard**

#### **Option A: GitHub Integration (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository: `avrlodge_v2`
5. Configure project settings (see below)
6. Click "Deploy"

#### **Option B: Vercel CLI**
```bash
cd D:\personal\projects\resorts\repo\avrlodge_v2
vercel --prod
```

## ⚙️ **Vercel Project Configuration**

### **Build Settings**
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build-deploy`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `18.x`

### **Environment Variables**
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDZxKLNEHICeyOoIwiJdAVf6ULMbW-Kq_c
VITE_FIREBASE_AUTH_DOMAIN=avrlodgev2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=avrlodgev2
VITE_FIREBASE_STORAGE_BUCKET=avrlodgev2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=423109120986
VITE_FIREBASE_APP_ID=1:423109120986:web:69500d1e043f9cc170e6e3
VITE_FIREBASE_MEASUREMENT_ID=G-HSKHTM1097

# Supabase Configuration
VITE_SUPABASE_URL=https://gyscskrvuxpgysletrvz.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Environment
NODE_ENV=production
VITE_ENV=production
```

### **Domain Configuration**
- **Production Domain**: Will be auto-assigned (e.g., `avrlodge-v2.vercel.app`)
- **Custom Domain**: Add your domain in Project Settings → Domains

## 🔧 **Deployment Checklist**

### **Before Deployment:**
- [ ] All environment variables added to Vercel
- [ ] Firebase project is in production mode
- [ ] Supabase storage bucket is configured
- [ ] Build command runs successfully locally: `npm run build-deploy`
- [ ] Git repository is pushed to GitHub

### **After Deployment:**
- [ ] Test authentication (login/signup)
- [ ] Test admin dashboard access
- [ ] Test booking creation and management
- [ ] Test calendar functionality
- [ ] Test payment processing
- [ ] Test document upload functionality

## 🌐 **Firebase Security Rules**

### **Update Firestore Rules for Production:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to any user signed in to the application
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 📱 **DNS Configuration (Optional)**

If using custom domain:
1. Add domain in Vercel Dashboard
2. Update DNS records:
   - **Type**: A
   - **Name**: @ (or subdomain)
   - **Value**: 76.76.19.61
   - **TTL**: 3600

## 🔍 **Monitoring & Analytics**

### **Vercel Analytics**
- Enable in Project Settings → Analytics
- Monitor Core Web Vitals and performance

### **Firebase Analytics**
- Already configured with `VITE_FIREBASE_MEASUREMENT_ID`
- View analytics in Firebase Console

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Build Fails**
```bash
# Test locally first
npm run build-deploy
```

#### **Environment Variables Not Loading**
- Ensure all variables have `VITE_` prefix for Vite apps
- Check spelling and values in Vercel dashboard

#### **Firebase Connection Issues**
- Verify all Firebase environment variables
- Check Firebase project permissions

#### **404 Errors on Refresh**
- Already handled by `vercel.json` rewrites configuration

### **Logs & Debugging**
- View deployment logs in Vercel Dashboard
- Check Runtime logs for serverless functions
- Use browser DevTools for client-side issues

## 📞 **Support**
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Supabase Dashboard](https://app.supabase.com)

---

## 🎯 **Deployment Status**
- ✅ **Code Ready**: All issues fixed for production
- ✅ **Build Working**: `npm run build-deploy` successful
- ✅ **Config Files**: `vercel.json` and `.env.production` created
- ✅ **Authentication**: User role persistence fixed
- ✅ **Calendar**: Date serialization issues resolved
- 🚀 **Ready to Deploy**: All systems go!