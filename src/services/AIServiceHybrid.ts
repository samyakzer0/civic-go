/**
 * Hybrid AI Image Analysis Service
 * Combines multiple free APIs with intelligent fallback
 *
 * Priority Order:
 * 1. Clarifai (Free tier: 5,000 operations/month)
 * 2. Hugging Face (Free tier: 30,000 requests/month)
 * 3. TensorFlow.js (Browser-based, unlimited)
 * 4. Mock fallback (Always works)
 */

import { analyzeImageWithClarifai, fallbackAnalysis as clarifaiFallback } from './AIServiceClarifai';
import { analyzeImage as analyzeWithHuggingFace } from './AIServiceHuggingFace';
import { analyzeImage as analyzeWithTensorFlow } from './AIService';

// Interface for AI analysis result
export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
}

/**
 * Main image analysis function with multiple API fallbacks
 * @param imageData Base64 encoded image data
 * @returns Promise with analysis result
 */
export const analyzeImage = async (imageData: string): Promise<AIAnalysisResult> => {
  const apis = [
    {
      name: 'Clarifai',
      func: () => analyzeImageWithClarifai(imageData),
      enabled: !!import.meta.env.VITE_CLARIFAI_API_KEY
    },
    {
      name: 'Hugging Face',
      func: () => analyzeWithHuggingFace(imageData),
      enabled: !!import.meta.env.VITE_HUGGINGFACE_API_KEY
    },
    {
      name: 'TensorFlow.js',
      func: () => analyzeWithTensorFlow(imageData),
      enabled: true // Always available
    }
  ];

  // Try each API in order
  for (const api of apis) {
    if (!api.enabled) {
      console.log(`Skipping ${api.name} (API key not configured)`);
      continue;
    }

    try {
      console.log(`Attempting image analysis with ${api.name}...`);
      const result = await api.func();

      // Check if result is valid (not a fallback/mock)
      if (!result.description.includes('[MOCK DATA]')) {
        console.log(`✅ ${api.name} analysis successful`);
        return result;
      } else {
        console.log(`⚠️ ${api.name} returned mock data, trying next API...`);
      }
    } catch (error) {
      console.warn(`❌ ${api.name} failed:`, error);
      continue;
    }
  }

  // All APIs failed, use final fallback
  console.log('🚨 All APIs failed, using final fallback');
  return {
    title: 'Issue Detected',
    category: 'Others',
    description: '[FINAL FALLBACK] An issue was detected but could not be classified automatically. Please provide more details.',
    confidence: 0.3
  };
};

/**
 * Test all available APIs
 * @param imageData Base64 encoded image data
 * @returns Promise with test results from all APIs
 */
export const testAllAPIs = async (imageData: string) => {
  const results = {
    clarifai: null as AIAnalysisResult | null,
    huggingface: null as AIAnalysisResult | null,
    tensorflow: null as AIAnalysisResult | null,
    errors: [] as string[]
  };

  // Test Clarifai
  if (import.meta.env.VITE_CLARIFAI_API_KEY) {
    try {
      results.clarifai = await analyzeImageWithClarifai(imageData);
    } catch (error) {
      results.errors.push(`Clarifai: ${error}`);
    }
  }

  // Test Hugging Face
  if (import.meta.env.VITE_HUGGINGFACE_API_KEY) {
    try {
      results.huggingface = await analyzeWithHuggingFace(imageData);
    } catch (error) {
      results.errors.push(`Hugging Face: ${error}`);
    }
  }

  // Test TensorFlow.js
  try {
    results.tensorflow = await analyzeWithTensorFlow(imageData);
  } catch (error) {
    results.errors.push(`TensorFlow.js: ${error}`);
  }

  return results;
};

/**
 * Get API status and availability
 * @returns Object with API availability status
 */
export const getAPIStatus = () => {
  return {
    clarifai: {
      available: !!import.meta.env.VITE_CLARIFAI_API_KEY,
      configured: !!import.meta.env.VITE_CLARIFAI_API_KEY
    },
    huggingface: {
      available: !!import.meta.env.VITE_HUGGINGFACE_API_KEY,
      configured: !!import.meta.env.VITE_HUGGINGFACE_API_KEY
    },
    tensorflow: {
      available: true, // Always available
      configured: true
    }
  };
};

export default {
  analyzeImage,
  testAllAPIs,
  getAPIStatus
};
