# Free AI Image Analysis Alternatives for CivicGo

This document provides implementation instructions for using free alternatives to the Google Cloud Vision API in the CivicGo application.

## Option 1: Hugging Face Inference API

Hugging Face provides a free tier for their inference API that can be used for image classification.

### Setup Instructions

1. Create a free Hugging Face account at [huggingface.co](https://huggingface.co)
2. Generate an API token in your account settings
3. Add the API token to your `.env` file:

```
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_token
```

4. Install the required dependency:

```bash
npm install axios
```

5. Replace the current AIService.ts with AIServiceHuggingFace.ts:

```bash
mv src/services/AIServiceHuggingFace.ts src/services/AIService.ts
```

### Benefits
- Free tier with up to 30,000 requests per month
- Variety of pre-trained models
- No credit card required

### Limitations
- API rate limits
- Not as accurate as Google Vision for some civic issues
- Requires internet connection

## Option 2: TensorFlow.js (Browser-based)

TensorFlow.js runs entirely in the browser with no API calls or costs.

### Setup Instructions

1. Install the required dependencies:

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl
```

2. Make sure the imagenet_classes.js file is in the services directory
3. Replace the current AIService.ts with AIServiceTensorFlow.ts:

```bash
mv src/services/AIServiceTensorFlow.ts src/services/AIService.ts
```

### Benefits
- Completely free, no API keys or limits
- Works offline (after initial model download)
- No privacy concerns since everything runs locally

### Limitations
- Initial model download (about 5MB)
- Limited accuracy compared to cloud APIs
- Uses client resources (CPU/GPU/memory)

## Option 3: Hybrid Approach with Fallback

You can implement a hybrid approach that attempts to use the Hugging Face API first and falls back to TensorFlow.js if that fails.

### Implementation Steps

1. Create a new AIService.ts file that combines both approaches:

```typescript
import { analyzeImage as analyzeWithHuggingFace } from './AIServiceHuggingFace';
import { analyzeImage as analyzeWithTensorFlow } from './AIServiceTensorFlow';

// Interface for AI analysis result
interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
}

// Hybrid approach
export const analyzeImage = async (imageData: string): Promise<AIAnalysisResult> => {
  try {
    // First try Hugging Face
    const huggingFaceApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (huggingFaceApiKey) {
      try {
        console.log('Attempting to use Hugging Face API...');
        return await analyzeWithHuggingFace(imageData);
      } catch (error) {
        console.warn('Hugging Face API failed, falling back to TensorFlow.js', error);
      }
    }
    
    // Fall back to TensorFlow.js
    console.log('Using TensorFlow.js for image analysis...');
    return await analyzeWithTensorFlow(imageData);
    
  } catch (error) {
    console.error('All AI image analysis methods failed:', error);
    
    // Fall back to mock analysis as a last resort
    return {
      title: 'Issue Detected',
      category: 'Others',
      description: '[MOCK DATA] An issue was detected but could not be classified automatically. Please provide more details.',
      confidence: 0.5
    };
  }
};
```

## Option 4: Self-Hosted Models with TensorFlow Serving

For larger deployments, you could consider self-hosting TensorFlow models using TensorFlow Serving.

### Basic Setup

1. Install Docker
2. Pull and run a TensorFlow Serving container with a pre-trained model
3. Create an API endpoint on your server that communicates with TensorFlow Serving
4. Update your frontend to call your self-hosted API

## Comparison of Options

| Option | Cost | Setup Difficulty | Accuracy | Privacy | Offline Use |
|--------|------|------------------|----------|---------|-------------|
| Google Vision API | Paid (after free tier) | Easy | Excellent | Low | No |
| Hugging Face API | Free tier | Easy | Good | Medium | No |
| TensorFlow.js | Free | Medium | Moderate | High | Yes |
| Self-Hosted | Server costs | Difficult | Good | High | No |

## Recommended Approach

For the CivicGo application, we recommend:

1. **Development/Testing**: Use TensorFlow.js for unlimited free development and testing
2. **Initial Production**: Use Hugging Face's free tier
3. **Scale Up**: If usage grows beyond free limits, consider a hybrid approach or self-hosting

Remember to update the `.env.example` file to include the necessary variables for whichever solution you choose.
