# API Key Security

This application uses a Google Gemini API key for client-side analysis. The key is embedded in the JavaScript bundle, which is **expected behavior** for client-side applications.

## Security Measures

### 1. API Key Restrictions (CRITICAL)
The API key used in this repository is **heavily restricted** in Google Cloud Console:

- **HTTP Referrer Restrictions**: Only allows requests from:
  - `https://*.github.io/college_essay/*`
  - `http://localhost:*` (for development)
  
- **API Restrictions**: Limited to only the "Generative Language API" (Gemini API)

This means:
- ✅ The key can only be used from the deployed GitHub Pages site
- ✅ The key cannot access any other Google Cloud services
- ✅ Even if someone copies the key, they cannot use it from other domains

### 2. Why the Key is in the Bundle
Client-side JavaScript applications require API keys to be in the bundle. This is standard practice for:
- Google Maps API
- Stripe (publishable keys)
- Firebase (client configs)
- And other client-side services

### 3. If GitHub Detects the Key
If GitHub's secret scanning detects the key:

1. **Don't panic** - The key is already restricted and safe
2. **Mark as false positive** in GitHub's security alerts
3. **Add to allowlist** if GitHub provides that option
4. The key cannot be abused due to domain restrictions

### 4. For Your Own Use
Users can override the default key by:
- Clicking the key icon in the app
- Entering their own API key
- Their key is stored locally in browser localStorage (never sent to our servers)

## Best Practices

- ✅ Always use domain-restricted API keys for client-side apps
- ✅ Always use API-restricted keys (limit to specific APIs)
- ✅ Monitor usage in Google Cloud Console
- ✅ Rotate keys periodically if needed
- ✅ Never use unrestricted keys in public repositories

