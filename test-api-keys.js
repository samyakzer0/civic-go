/**
 * Quick API Key Test Script
 * Run this in your browser console to test API keys
 */

// Test Clarifai API Key
async function testClarifaiKey(apiKey) {
  console.log('🧪 Testing Clarifai API Key...');

  try {
    const response = await fetch('https://api.clarifai.com/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c7f/outputs', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
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
    });

    if (response.ok) {
      console.log('✅ Clarifai API Key is working!');
      return true;
    } else {
      console.log('❌ Clarifai API Key failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Clarifai API Key error:', error.message);
    return false;
  }
}

// Test Hugging Face API Key
async function testHuggingFaceKey(apiKey) {
  console.log('🤗 Testing Hugging Face API Key...');

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/resnet-50', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream'
      },
      body: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 11, 73, 68, 65, 84, 120, 156, 99, 248, 15, 0, 0, 1, 0, 1, 0, 24, 221, 219, 118, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])
    });

    if (response.ok) {
      console.log('✅ Hugging Face API Key is working!');
      return true;
    } else {
      console.log('❌ Hugging Face API Key failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Hugging Face API Key error:', error.message);
    return false;
  }
}

// Main test function
async function testAPIKeys() {
  console.log('🚀 API Key Testing Tool');
  console.log('=' .repeat(30));

  // Get API keys from environment or prompt user
  const clarifaiKey = import.meta.env?.VITE_CLARIFAI_API_KEY || prompt('Enter your Clarifai API Key (or press Cancel to skip):');
  const huggingfaceKey = import.meta.env?.VITE_HUGGINGFACE_API_KEY || prompt('Enter your Hugging Face API Key (or press Cancel to skip):');

  let clarifaiWorking = false;
  let huggingfaceWorking = false;

  if (clarifaiKey) {
    clarifaiWorking = await testClarifaiKey(clarifaiKey);
  } else {
    console.log('⏭️ Skipping Clarifai test (no key provided)');
  }

  console.log('');

  if (huggingfaceKey) {
    huggingfaceWorking = await testHuggingFaceKey(huggingfaceKey);
  } else {
    console.log('⏭️ Skipping Hugging Face test (no key provided)');
  }

  console.log('');
  console.log('📊 Results Summary:');
  console.log(`   Clarifai: ${clarifaiWorking ? '✅ Working' : '❌ Not working'}`);
  console.log(`   Hugging Face: ${huggingfaceWorking ? '✅ Working' : '❌ Not working'}`);

  if (clarifaiWorking || huggingfaceWorking) {
    console.log('');
    console.log('🎉 Great! At least one API is working.');
    console.log('Your CivicGo app should now have AI image recognition!');
  } else {
    console.log('');
    console.log('⚠️ No APIs are working. Your app will use TensorFlow.js fallback.');
    console.log('For better accuracy, please set up at least one API key.');
  }

  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Add working API keys to your .env file');
  console.log('   2. Restart your development server');
  console.log('   3. Test image upload in your app');
}

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
  // Running in browser
  console.log('🔧 API Key Test Tool Loaded!');
  console.log('Run: testAPIKeys()');
  window.testAPIKeys = testAPIKeys;
} else {
  // Running in Node.js
  console.log('This script should be run in a browser console.');
  console.log('Copy and paste the code into your browser developer console.');
}
