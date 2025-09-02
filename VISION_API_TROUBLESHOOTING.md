# Google Cloud Vision API Troubleshooting Guide

If you're seeing a 403 Forbidden error when trying to use the Google Cloud Vision API, follow these steps to resolve the issue:

## Step 1: Verify Your API Key

Make sure your API key is correctly set in the `.env` file:

```
VITE_VISION_AI_API_KEY=your_actual_api_key_here
```

The key should be a long string without any quotes or spaces.

## Step 2: Enable the Vision API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Cloud Vision API"
5. Click on it and press "ENABLE"

## Step 3: Check API Key Permissions

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" > "Credentials"
3. Find your API key in the list and click on it
4. Ensure it has access to the Vision API
5. Check if there are any API restrictions that might be blocking the Vision API

## Step 4: Verify Billing is Enabled

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "Billing"
3. Make sure your project is linked to a billing account
4. The Vision API requires an active billing account, even if you're within the free tier

## Step 5: Create a New API Key (if needed)

If the above steps don't work, try creating a new API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Go to "APIs & Services" > "Credentials"
3. Click "CREATE CREDENTIALS" > "API key"
4. Copy the new key and update your `.env` file
5. (Optional) Add API restrictions to the key for security

## Testing the API

You can test if your API key works directly by running this in your browser console:

```javascript
fetch(`https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY`, {
  method: 'POST',
  body: JSON.stringify({
    requests: [{
      image: {
        content: "base64_encoded_image_here" // Replace with a small base64 image
      },
      features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
    }]
  })
}).then(r => r.json()).then(console.log)
```

Replace `YOUR_API_KEY` with your actual key and `base64_encoded_image_here` with a small base64 encoded image.

## Common Error Messages

- **403 Forbidden**: API key is invalid, disabled, or doesn't have Vision API access
- **400 Bad Request**: Problem with your request format
- **429 Too Many Requests**: You've exceeded your quota
