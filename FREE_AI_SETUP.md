# Free AI Image Recognition APIs Setup Guide

## 🎯 **Available Free APIs**

Your CivicGo app now supports multiple free AI image recognition APIs with automatic fallback:

### 1. **Clarifai** (Recommended - Most Accurate)
- **Free Tier:** 5,000 operations/month
- **Setup:** Get API key from [clarifai.com](https://clarifai.com/)
- **Accuracy:** High for general object detection

### 2. **Hugging Face** (Good Alternative)
- **Free Tier:** 30,000 requests/month
- **Setup:** Get API token from [huggingface.co](https://huggingface.co/)
- **Accuracy:** Good for general classification

### 3. **TensorFlow.js** (Always Available)
- **Cost:** Free (runs in browser)
- **Setup:** No API key needed
- **Accuracy:** Moderate, works offline

## 🚀 **Quick Setup**

### Step 1: Choose Your Primary API

**Option A: Clarifai (Recommended)**
```bash
# Get API key from clarifai.com
# Add to your .env file:
VITE_CLARIFAI_API_KEY=your_clarifai_api_key_here
```

**Option B: Hugging Face**
```bash
# Get API token from huggingface.co
# Add to your .env file:
VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
```

**Option C: No API (TensorFlow.js Only)**
```bash
# No changes needed - works out of the box
```

### Step 2: Test Your Setup

```bash
# Test all configured APIs
npm run test-apis
```

### Step 3: Verify in Browser

1. Open your app
2. Take a photo or upload an image
3. Check browser console for API usage logs
4. Verify the analysis results

## 📊 **API Priority & Fallback**

```
1. Clarifai (if API key configured)
   ↓ (if fails)
2. Hugging Face (if API key configured)
   ↓ (if fails)
3. TensorFlow.js (always available)
   ↓ (if fails)
4. Mock Fallback (always works)
```

## 🔧 **Environment Variables**

Add these to your `.env` file:

```env
# Clarifai API (Recommended)
VITE_CLARIFAI_API_KEY=your_clarifai_key

# Hugging Face API (Alternative)
VITE_HUGGINGFACE_API_KEY=your_huggingface_token

# Force fallback for testing
VITE_FORCE_AI_FALLBACK=false
```

## 🧪 **Testing Commands**

```bash
# Test all APIs with a sample image
node test-apis.js

# Check API status
node check-api-status.js
```

## 📈 **Usage Limits**

| API | Free Limit | Reset Period |
|-----|------------|--------------|
| Clarifai | 5,000 ops | Monthly |
| Hugging Face | 30,000 req | Monthly |
| TensorFlow.js | Unlimited | N/A |

## 🔍 **Debugging**

### Check Console Logs
```
✅ Clarifai analysis successful
⚠️ Clarifai returned mock data, trying next API...
❌ Clarifai failed: [error details]
```

### Common Issues

**403 Forbidden (Clarifai/Hugging Face):**
- Check API key is correct
- Verify API is enabled
- Check rate limits

**Network Errors:**
- Check internet connection
- Try different API
- Use TensorFlow.js fallback

**Low Accuracy:**
- Try Clarifai (most accurate)
- Ensure good image quality
- Check image is not blurry

## 🎯 **Best Practices**

1. **Start with Clarifai** for best accuracy
2. **Keep TensorFlow.js** as reliable fallback
3. **Monitor API usage** to avoid limits
4. **Test regularly** with different image types
5. **Have mock fallback** for offline/demo mode

## 📞 **Support**

- **Clarifai:** [clarifai.com/support](https://clarifai.com/support)
- **Hugging Face:** [huggingface.co/support](https://huggingface.co/support)
- **TensorFlow.js:** [tensorflow.org/js](https://tensorflow.org/js)

---

**🎉 Your app now has robust, free AI image recognition with multiple fallbacks!**
