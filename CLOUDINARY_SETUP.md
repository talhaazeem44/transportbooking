# 📸 Cloudinary Setup Guide

Cloudinary provides permanent cloud storage for images - perfect for Railway's ephemeral filesystem.

## Step 1: Create Cloudinary Account

1. **Sign up:** https://cloudinary.com/users/register/free
2. Email verify karo
3. Dashboard me jao

## Step 2: Get API Credentials

1. Cloudinary Dashboard → **Settings** (gear icon)
2. **Product Environment Credentials** section me:
   - **Cloud Name** - Copy karo
   - **API Key** - Copy karo
   - **API Secret** - "Reveal" click karke copy karo

## Step 3: Add to Railway Environment Variables

Railway Dashboard → Project → Settings → Variables me add karo:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=transportbooking/vehicles
```

**Important:** 
- Replace `your-cloud-name`, `your-api-key`, `your-api-secret` with apne actual credentials
- `CLOUDINARY_FOLDER` (optional) - Images ka folder name. Default: `transportbooking/vehicles`
  - Example: `myapp/images`, `vehicles`, `transport/vehicles` - jo bhi chahe
  - Cloudinary me yeh "folder" (bucket jaisa) organize karega images ko

## Step 4: Redeploy

Railway automatically redeploy karega, ya manually redeploy karo.

## How It Works

- **If Cloudinary configured:** Images Cloudinary me upload hongi (permanent storage)
- **If Cloudinary NOT configured:** Local filesystem use hoga (fallback)

## Benefits

✅ **Permanent Storage** - Images never get deleted  
✅ **CDN** - Fast image delivery worldwide  
✅ **Image Optimization** - Automatic compression and optimization  
✅ **Free Tier** - 25GB storage, 25GB bandwidth/month  

## Testing

1. Admin panel me image upload karo
2. Railway logs check karo:
   - `[Upload] Using Cloudinary for storage` - Cloudinary use ho raha hai
   - `[Upload] ✅ Uploaded to Cloudinary: https://...` - Success!
3. Home page par image check karo - ab permanent rahegi

## Troubleshooting

### Error: "Invalid API credentials"
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` correct hain
- API Secret properly copied hai? (no extra spaces)

### Still using local storage?
- Check Railway logs - `[Upload] Using Cloudinary` dikhna chahiye
- Environment variables properly set hain?

---

**Note:** Cloudinary free tier is generous (25GB storage). For production, this is perfect!
