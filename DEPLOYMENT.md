# 🚀 Deployment Guide

## Option 1: Railway (Recommended - Best for Socket.IO)

Railway supports Socket.IO, file uploads, and custom servers perfectly.

### Steps:

1. **Sign up:** https://railway.app (GitHub se sign up karo)

2. **New Project:**
   - "New Project" → "Deploy from GitHub repo"
   - Apna repository select karo

3. **Environment Variables:**
   Railway dashboard me Settings → Variables me add karo:
   ```
   MONGODB_URI=mongodb+srv://arslankibria98_db_user:fWpSz13VuMFveWGn@auction.ymxj75n.mongodb.net/
   MONGODB_DB=transportbooking
   
   ADMIN_EMAIL_TO=arslankibria98@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=arslankibria98@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=arslankibria98@gmail.com
   
   ADMIN_TOKEN_SECRET=change-this-secret-key-in-production
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy:**
   - Railway automatically detect karega
   - Build start ho jayega
   - Deploy complete hone ke baad URL milega

5. **Post-Deployment:**
   ```bash
   # Railway CLI se connect karo
   railway run npm run db:seed
   railway run npm run admin:create admin admin123
   ```

### Railway CLI:
```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

---

## Option 2: Vercel (Easy but Socket.IO limited)

**⚠️ Note:** Vercel me Socket.IO kaam nahi karega (serverless functions don't support WebSockets)

### Steps:

1. **Sign up:** https://vercel.com (GitHub se)

2. **Import Project:**
   - "New Project" → GitHub repo select karo

3. **Configure:**
   - Framework: **Other**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Environment Variables:**
   Vercel dashboard → Settings → Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://arslankibria98_db_user:fWpSz13VuMFveWGn@auction.ymxj75n.mongodb.net/
   MONGODB_DB=transportbooking
   
   ADMIN_EMAIL_TO=arslankibria98@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=arslankibria98@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=arslankibria98@gmail.com
   
   ADMIN_TOKEN_SECRET=your-secret-key
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build

### Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel
```

---

## Option 3: Render (Good for Socket.IO)

1. **Sign up:** https://render.com

2. **New Web Service:**
   - Connect GitHub repo
   - Settings:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run start`
     - Environment: Node

3. **Environment Variables:** (same as Railway)

4. **Deploy**

---

## Post-Deployment Checklist

✅ **Database Setup:**
```bash
npm run db:seed
```

✅ **Admin User:**
```bash
npm run admin:create admin admin123
```

✅ **Test:**
- Home page load ho raha hai?
- Admin login kaam kar raha hai?
- Form submit ho raha hai?
- Notifications aa rahe hain?

---

## Important Notes

### Socket.IO:
- ✅ **Railway/Render:** Full support
- ❌ **Vercel:** Limited (serverless functions)

### File Uploads:
- ✅ **Railway/Render:** Local storage works
- ❌ **Vercel:** Need cloud storage (S3, Cloudinary)

### Recommended:
**Railway** - Best for this project (Socket.IO + file uploads)

---

## Quick Deploy (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

Deployment complete! 🎉
