# 📸 Cloudinary Account Banane Ka Complete Guide

## Step 1: Cloudinary Website Par Jao

1. Browser me jao: **https://cloudinary.com/users/register/free**
2. Ya directly: **https://cloudinary.com** → Top right corner me **"Sign Up Free"** click karo

## Step 2: Account Details Bharo

1. **Email Address** - Apna email dalo (e.g., `arslankibria98@gmail.com`)
2. **Full Name** - Apna naam dalo
3. **Password** - Strong password banao (minimum 8 characters)
4. **Company Name** (Optional) - Chhod sakte ho ya apna naam dalo
5. **I agree to the Terms of Service** checkbox tick karo
6. **"Create Account"** button click karo

## Step 3: Email Verification

1. Apne email inbox me jao
2. Cloudinary se verification email aayega
3. Email me **"Verify Email"** ya **"Confirm Account"** button click karo
4. Browser me automatically Cloudinary dashboard khul jayega

## Step 4: Dashboard Me Credentials Dekho

Account verify hone ke baad, Cloudinary Dashboard me:

1. **Top right corner** me apna naam click karo
2. **Settings** (gear icon) click karo
   - Ya directly: **https://cloudinary.com/console/settings**

3. **Product Environment Credentials** section me yeh 3 cheezein copy karo:

   ```
   Cloud Name: dxxxxxxxxx
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123456
   ```

   **Important:** 
   - **API Secret** ke saamne **"Reveal"** button hoga - usko click karke secret dikhao
   - Har ek ko carefully copy karo (no extra spaces)

## Step 5: Railway Me Variables Add Karo

1. **Railway Dashboard** → Apna project select karo
2. **Settings** tab → **Variables** section
3. **"New Variable"** click karo
4. 3 variables add karo:

   **Variable 1:**
   - Key: `CLOUDINARY_CLOUD_NAME`
   - Value: Apna Cloud Name (e.g., `dxxxxxxxxx`)
   - **Add** click karo

   **Variable 2:**
   - Key: `CLOUDINARY_API_KEY`
   - Value: Apna API Key (e.g., `123456789012345`)
   - **Add** click karo

   **Variable 3:**
   - Key: `CLOUDINARY_API_SECRET`
   - Value: Apna API Secret (e.g., `abcdefghijklmnopqrstuvwxyz123456`)
   - **Add** click karo

   **Variable 4 (Optional - Folder Name):**
   - Key: `CLOUDINARY_FOLDER`
   - Value: `transportbooking/vehicles` (ya jo bhi naam chahe)
   - **Add** click karo

## Step 6: Redeploy

Railway automatically redeploy karega, ya manually:
1. **Deployments** tab → **"Redeploy"** click karo

## Step 7: Test Karo

1. Admin panel me jao: `/admin/vehicles`
2. Koi vehicle edit karo ya naya add karo
3. Image upload karo
4. Railway logs check karo:
   - `[Upload] Using Cloudinary for storage` - Success! ✅
   - `[Upload] ✅ Uploaded to Cloudinary: https://res.cloudinary.com/...` - Image URL!

## Cloudinary Dashboard Me Images Dekhne Ke Liye

1. Cloudinary Dashboard → **Media Library** (left sidebar)
2. Abhi kuch nahi dikhega (pehli baar)
3. Jab image upload hogi, yahan dikhegi
4. **Folders** section me `transportbooking/vehicles` folder dikhega

## Free Tier Limits

✅ **25GB Storage** - Kaafi hai!  
✅ **25GB Bandwidth/month** - Monthly limit  
✅ **Unlimited Transformations** - Image optimization free  
✅ **No Credit Card Required** - Completely free!

## Troubleshooting

### "Invalid API credentials" Error?
- Check karo ki 3 variables properly add hue hain
- API Secret me extra spaces to nahi?
- Cloud Name, API Key, API Secret sahi copy kiye hain?

### Still using local storage?
- Railway logs check karo
- `[Upload] Using Cloudinary` dikhna chahiye
- Environment variables properly set hain?

### Email verification nahi aaya?
- Spam folder check karo
- Email address sahi hai?
- Resend verification email option use karo

---

**Ready?** Account banao aur Railway me variables add karo! 🚀
