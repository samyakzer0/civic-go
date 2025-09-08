/**
 * Test script for all free AI image recognition APIs
 * Run with: node test-free-apis.js
 */

import { testAllAPIs, getAPIStatus } from './src/services/AIServiceHybrid.js';

// Sample base64 encoded image (1x1 pixel PNG)
const sampleImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testAPIs() {
  console.log('🧪 Testing Free AI Image Recognition APIs\n');
  console.log('=' .repeat(50));

  // Check API status
  console.log('📊 API Status:');
  const status = getAPIStatus();
  console.log(`  Clarifai: ${status.clarifai.configured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Hugging Face: ${status.huggingface.configured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  TensorFlow.js: ✅ Always available`);
  console.log('');

  // Test all APIs
  console.log('🔍 Testing APIs with sample image...');
  const results = await testAllAPIs(sampleImageData);

  console.log('\n📋 Results:');
  console.log('=' .repeat(30));

  if (results.clarifai) {
    console.log('🎯 Clarifai:');
    console.log(`   Title: ${results.clarifai.title}`);
    console.log(`   Category: ${results.clarifai.category}`);
    console.log(`   Confidence: ${(results.clarifai.confidence * 100).toFixed(1)}%`);
    console.log('');
  }

  if (results.huggingface) {
    console.log('🤗 Hugging Face:');
    console.log(`   Title: ${results.huggingface.title}`);
    console.log(`   Category: ${results.huggingface.category}`);
    console.log(`   Confidence: ${(results.huggingface.confidence * 100).toFixed(1)}%`);
    console.log('');
  }

  if (results.tensorflow) {
    console.log('🧠 TensorFlow.js:');
    console.log(`   Title: ${results.tensorflow.title}`);
    console.log(`   Category: ${results.tensorflow.category}`);
    console.log(`   Confidence: ${(results.tensorflow.confidence * 100).toFixed(1)}%`);
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }

  console.log('💡 Tips:');
  if (!status.clarifai.configured && !status.huggingface.configured) {
    console.log('   - Configure at least one API key for better accuracy');
    console.log('   - TensorFlow.js will work as fallback');
  }
  if (results.errors.length > 0) {
    console.log('   - Check your API keys in .env file');
    console.log('   - Verify internet connection');
    console.log('   - Check API rate limits');
  }

  console.log('\n✅ Test completed!');
}

// Handle ES modules in Node.js
if (typeof window === 'undefined') {
  // Running in Node.js
  console.log('This test script is designed to run in a browser environment.');
  console.log('Please run it in your browser console or use a tool like Playwright.');
  console.log('');
  console.log('To test manually:');
  console.log('1. Open your app in browser');
  console.log('2. Open developer console');
  console.log('3. Run: import("./src/services/AIServiceHybrid.js").then(m => m.testAllAPIs("your_image_data"))');
} else {
  // Running in browser
  testAPIs();
}
