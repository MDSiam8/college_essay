# Preventing API Key Issues with Google & GitHub

## Step-by-Step Protection Guide

### 1. **Set Up API Key Restrictions in Google Cloud (CRITICAL)**

This is the **most important step**. Even if the key is detected, it can't be abused.

#### Go to Google Cloud Console:
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your API key and click on it
3. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Click **"Add an item"** and add:
     - `https://*.github.io/college_essay/*`
     - `http://localhost:*` (for local development)
   - **Save**

4. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose **"Generative Language API"** only
   - **Save**

✅ **Result**: Even if someone copies your key, they can only use it from your GitHub Pages domain and only for the Gemini API.

### 2. **Handle GitHub Secret Scanning Alerts**

When GitHub detects your key:

1. **Go to Security tab** → **Secret scanning** → **Open alerts**
2. **Click on the alert**
3. **Mark as "False positive"** or **"Used in tests"**
4. **Add a note**: "This is a client-side API key with domain restrictions. Safe for public use."
5. **Close the alert**

### 3. **Optional: Create a Dedicated Key for Public Repo**

Best practice: Create a separate API key just for this public repository:

1. In Google Cloud Console, create a **new API key**
2. Name it: `college-essay-lab-public`
3. Apply the restrictions above
4. Use this key in your GitHub secret
5. Keep your main key private

### 4. **Monitor Usage**

Set up alerts in Google Cloud:

1. Go to **APIs & Services** → **Dashboard**
2. Set up **usage quotas** and **alerts**
3. Monitor for unusual activity

### 5. **Why This Works**

- ✅ **Domain restriction** = Key only works from your site
- ✅ **API restriction** = Key can't access other Google services
- ✅ **Monitoring** = You'll know if something's wrong
- ✅ **Separate key** = If compromised, you can revoke just this one

### 6. **If Google Still Blocks It**

If Google detects the key and tries to restrict it:

1. **Contact Google Cloud Support** and explain:
   - This is a client-side application
   - The key is domain-restricted
   - It's intentionally public (like Google Maps keys)
   - It follows best practices

2. **Reference this documentation**:
   - Google's own client-side API key documentation
   - Similar patterns (Google Maps, Firebase, etc.)

3. **Show your restrictions**:
   - Screenshot of HTTP referrer restrictions
   - Screenshot of API restrictions

### 7. **Alternative: Use a Backend Proxy (Advanced)**

If you want to completely hide the key:

- Create a simple backend API (Node.js, Python, etc.)
- Store the key server-side
- Have your frontend call your backend
- Backend calls Gemini API

**Trade-off**: More complex, requires hosting a backend server.

---

## Quick Checklist

- [ ] API key has HTTP referrer restrictions (your domain only)
- [ ] API key has API restrictions (Gemini API only)
- [ ] Usage quotas/alerts set up in Google Cloud
- [ ] GitHub alerts marked as false positive with explanation
- [ ] Monitoring enabled for unusual activity
- [ ] Separate key created for public repo (optional but recommended)

---

## Remember

**Client-side API keys are meant to be public** - that's how Google Maps, Stripe, Firebase, and other services work. The security comes from **restrictions**, not **secrecy**.

