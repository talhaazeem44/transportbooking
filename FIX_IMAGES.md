# 🔧 Fix Vehicle Images - Quick Guide

Railway me uploaded images delete ho jati hain (ephemeral filesystem). Isliye existing vehicles ko external URLs se update karna hai.

## Option 1: Run Fix Script (Recommended)

Railway me script run karo:

### Railway Dashboard se:
1. Railway Dashboard → Project → **Deployments**
2. Latest deployment click karo
3. **View Logs** → **Shell** tab
4. Run:
```bash
npm run fix:images
```

### Ya Railway CLI se:
```bash
railway run npm run fix:images
```

Ye script:
- Database me sab vehicles check karega
- Local/Railway paths (`/uploads/` ya `railway.app/uploads/`) ko external Unsplash URLs se replace karega
- Seed data ke vehicles ko proper images assign karega

## Option 2: Setup Cloudinary (Permanent Solution)

**Best solution for future uploads!**

1. **Cloudinary account banao:** https://cloudinary.com/users/register/free
2. **Credentials copy karo:** Dashboard → Settings → Product Environment Credentials
3. **Railway Variables add karo:**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. **Redeploy** - Ab sab new uploads Cloudinary me jayengi (permanent!)

See `CLOUDINARY_SETUP.md` for detailed instructions.

## Option 3: Manual Update (Admin Panel)

1. Admin panel me jao: `/admin/vehicles`
2. Har vehicle ko edit karo
3. Image field me external URL paste karo (Unsplash, etc.)
4. Save karo

## Quick Test

After running fix script:
1. Home page refresh karo
2. Fleet section me images check karo
3. Images ab load honi chahiye! ✅

---

**Note:** Future me Cloudinary setup karo - yeh permanent solution hai!
