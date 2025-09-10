/**
 * Test script for Perplexity Pro AI Service
 * This script helps verify that the Perplexity API integration is working correctly
 */

// Import the AI service
import { analyzeImage } from './src/services/AIService.js';

// Sample base64 image data for testing (a small test image)
const SAMPLE_IMAGE_DATA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';

console.log('🔍 Testing Perplexity Pro AI Service...\n');

// Function to test the API
async function testPerplexityService() {
  try {
    console.log('📊 Analyzing sample image with Perplexity Pro...');
    
    const result = await analyzeImage(SAMPLE_IMAGE_DATA);
    
    console.log('✅ Analysis successful!');
    console.log('📋 Results:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Category: ${result.category}`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    
    return result;
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  }
}

// Function to check API key configuration
function checkConfiguration() {
  console.log('🔧 Checking configuration...');
  
  const apiKey = process.env.VITE_PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  VITE_PERPLEXITY_API_KEY not found in environment variables');
    console.log('📝 Please add your Perplexity API key to your .env file:');
    console.log('   VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here');
    return false;
  }
  
  if (apiKey === 'your_perplexity_api_key_here') {
    console.log('⚠️  Please replace the placeholder API key with your actual Perplexity API key');
    return false;
  }
  
  console.log('✅ API key is configured');
  return true;
}

// Main test function
async function runTests() {
  console.log('🧪 Perplexity Pro AI Service Test Suite');
  console.log('='.repeat(40));
  
  // Check configuration
  const configOk = checkConfiguration();
  
  if (!configOk) {
    console.log('\n📖 Setup Instructions:');
    console.log('1. Sign up for Perplexity Pro at https://www.perplexity.ai/');
    console.log('2. Get your API key from the Perplexity dashboard');
    console.log('3. Add VITE_PERPLEXITY_API_KEY=your_api_key_here to your .env file');
    console.log('4. Run this test again');
    return;
  }
  
  // Test the service
  try {
    await testPerplexityService();
    console.log('\n🎉 All tests passed! Your Perplexity integration is working correctly.');
    console.log('\n💡 Benefits of Perplexity Pro:');
    console.log('   • Advanced vision capabilities');
    console.log('   • Detailed civic infrastructure analysis');
    console.log('   • Natural language descriptions');
    console.log('   • High accuracy for complex scenes');
  } catch (error) {
    console.log('\n❌ Tests failed. Please check your API key and internet connection.');
    console.log('   Make sure you have Perplexity Pro subscription with API access.');
  }
}

// Function to test with real civic infrastructure images
async function testWithRealImage(imageDataUrl) {
  console.log('\n🏗️ Testing with real civic infrastructure image...');
  
  try {
    const result = await analyzeImage(imageDataUrl);
    
    console.log('📊 Real Image Analysis Results:');
    console.log(`   🏷️  Title: ${result.title}`);
    console.log(`   📂 Category: ${result.category}`);
    console.log(`   📝 Description: ${result.description}`);
    console.log(`   🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    
    return result;
  } catch (error) {
    console.error('❌ Error analyzing real image:', error);
    throw error;
  }
}

// Export for use in other files
export { testPerplexityService, checkConfiguration, testWithRealImage };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
