// This script tests the Google Cloud Vision API with your API key
// Run it with: node test-vision-api.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Get the API key from .env file
const apiKey = process.env.VITE_VISION_AI_API_KEY;

if (!apiKey) {
  console.error('Error: VITE_VISION_AI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('Using API key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));

// Path to a test image - replace with your own image path if needed
const imagePath = path.join(__dirname, 'test-image.jpg');
let base64Image;

try {
  // Read and encode the image
  const imageBuffer = fs.readFileSync(imagePath);
  base64Image = imageBuffer.toString('base64');
  console.log('Successfully read image file');
} catch (error) {
  console.error('Error reading image file:', error.message);
  console.log('Using a simple 1x1 pixel image instead');
  
  // Use a 1x1 pixel as fallback
  base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdQI0QI19UAAAAABJRU5ErkJggg==';
}

// Test the Vision API
async function testVisionApi() {
  try {
    console.log('Sending request to Vision API...');
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 5 }
            ]
          }
        ]
      }
    );
    
    console.log('Success! API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error calling Vision API:');
    console.error(`Status: ${error.response?.status}`);
    console.error(`Error: ${error.message}`);
    
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 403) {
      console.error('\n⚠️ 403 Forbidden Error: This typically means your API key is invalid or lacks proper permissions.');
      console.error('1. Verify your API key is correct in .env file');
      console.error('2. Make sure the Vision API is enabled in your Google Cloud Console');
      console.error('3. Check that your billing is set up correctly for the API');
      console.error('\nSee VISION_API_TROUBLESHOOTING.md for more information');
    }
    
    return false;
  }
}

// Run the test
testVisionApi()
  .then(success => {
    if (success) {
      console.log('\n✅ Vision API test successful! Your API key works correctly.');
    } else {
      console.log('\n❌ Vision API test failed. Please check the error message above.');
    }
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
  });
