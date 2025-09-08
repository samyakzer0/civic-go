# 🔑 **How to Get Free API Keys**

## 🎯 **Choose Your API**

### **Option 1: Clarifai (Recommended - Most Accurate)**

#### **Step 1: Create Account**
1. Go to [clarifai.com](https://clarifai.com/)
2. Click **"Sign Up"** (top right)
3. Choose **"Sign up with email"**
4. Fill in your details and verify email

#### **Step 2: Get API Key**
1. After login, go to your **Account Settings**
2. Click on **"Security"** tab
3. Scroll to **"API Keys"** section
4. Click **"Create API Key"**
5. Copy the generated key

#### **Step 3: Configure in Your App**
```bash
# Add to your .env file:
VITE_CLARIFAI_API_KEY=your_clarifai_api_key_here
```

---

### **Option 2: Hugging Face**

#### **Step 1: Create Account**
1. Go to [huggingface.co](https://huggingface.co/)
2. Click **"Sign Up"** (top right)
3. Choose **"Sign up with email"**
4. Fill in your details and verify email

#### **Step 2: Get API Token**
1. After login, click your profile picture (top right)
2. Select **"Settings"**
3. Go to **"Access Tokens"** tab
4. Click **"New token"**
5. Give it a name (e.g., "CivicGo App")
6. Set role to **"Read"** (sufficient for our use)
7. Click **"Create token"**
8. **Copy the token immediately** (you won't see it again!)

#### **Step 3: Configure in Your App**
```bash
# Add to your .env file:
VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
```

---

## 🧪 **Test Your Setup**

### **Method 1: Quick Test**
```bash
# Run the test script
npm run test-apis
```

### **Method 2: Browser Console Test**
1. Open your app in browser
2. Open Developer Console (F12)
3. Run this code:
```javascript
// Test Clarifai
fetch('https://api.clarifai.com/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c7f/outputs', {
  method: 'POST',
  headers: {
    'Authorization': `Key YOUR_CLARIFAI_KEY`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: [{
      data: {
        image: {
          base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
      }
    }]
  })
}).then(r => r.json()).then(console.log)
```

---

## 📊 **Free Limits**

| API | Free Limit | Reset Period | Best For |
|-----|------------|--------------|----------|
| **Clarifai** | 5,000 operations | Monthly | **Most Accurate** |
| **Hugging Face** | 30,000 requests | Monthly | Good Alternative |
| **TensorFlow.js** | Unlimited | N/A | Always Works |

---

## 🚨 **Troubleshooting**

### **403 Forbidden Error**
- ✅ Check API key is correct
- ✅ Verify API is enabled in your account
- ✅ Make sure you're using the right key format

### **Network Errors**
- ✅ Check internet connection
- ✅ Try the other API as backup
- ✅ TensorFlow.js works offline

### **Rate Limit Exceeded**
- ✅ Wait for monthly reset
- ✅ Use TensorFlow.js as temporary backup
- ✅ Consider upgrading to paid tier if needed

---

## 💡 **Pro Tips**

1. **Start with Clarifai** - Most accurate for civic issues
2. **Keep both keys** - Better reliability with fallbacks
3. **Test regularly** - Monitor API status
4. **Have backup** - TensorFlow.js always works
5. **Monitor usage** - Track your free limits

---

## 🎯 **Quick Start Commands**

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your API key
echo "VITE_CLARIFAI_API_KEY=your_key_here" >> .env

# 3. Test the setup
npm run test-apis

# 4. Start your app
npm run dev
```

---

**🎉 Ready to get your free API key? Choose Clarifai for best accuracy!**
