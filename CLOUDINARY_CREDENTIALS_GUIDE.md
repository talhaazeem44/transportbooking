# 🔑 Cloudinary Credentials Kaise Nikale (Screenshot Based)

Aapke Cloudinary dashboard me yeh dikh raha hai:

## ✅ Jo Mil Gaya:
- **Cloud Name:** `doztlidjr` ✅

## 🔍 Ab Ye Karna Hai:

### Step 1: API Key Nikalo

Aapke screenshot me "ID" column me `10c1a26db64e4cbb029054c86e...` dikh raha hai. API Key ke liye:

**Option A:** Left sidebar me **"API Keys"** (Product environment settings ke neeche) click karo
- Wahan full API Key dikhega

**Option B:** Table me jo environment row hai, usko click karo
- Details page me API Key dikhega

### Step 2: API Secret Nikalo

1. Left sidebar me **"API Keys"** section me jao
2. **"API Secret"** field me **"Reveal"** button click karo
3. Copy karo (yeh sirf ek baar dikhega, carefully copy karo!)

## 📋 Railway Me Add Karo:

Railway Dashboard → Settings → Variables me yeh add karo:

```
CLOUDINARY_CLOUD_NAME=doztlidjr
CLOUDINARY_API_KEY=<API_KEY_YAHAN_PASTE_KARO>
CLOUDINARY_API_SECRET=<API_SECRET_YAHAN_PASTE_KARO>
CLOUDINARY_FOLDER=transportbooking/vehicles
```

**Important:**
- `doztlidjr` already mil gaya ✅
- API Key aur API Secret ko `< >` ke bina directly paste karo
- Extra spaces nahi hone chahiye

## 🎯 Quick Checklist:

- [ ] Cloud Name: `doztlidjr` ✅
- [ ] API Key: Left sidebar → "API Keys" se copy karo
- [ ] API Secret: "API Keys" section me "Reveal" click karke copy karo
- [ ] Railway me 4 variables add karo
- [ ] Redeploy karo

---

**Tip:** API Secret ko ek baar copy kar lo - agar miss ho gaya to regenerate karna padega!
