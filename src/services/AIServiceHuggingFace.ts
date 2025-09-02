import axios from 'axios';

// Interface for AI analysis result
interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
}

// Using Hugging Face's inference API (free tier) instead of Google Vision
export const analyzeImage = async (imageData: string): Promise<AIAnalysisResult> => {
  // Remove the data URL prefix to get just the base64 encoded image
  const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');
  
  try {
    // Get API key from environment variables - Hugging Face API key is free to create
    const huggingFaceApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    // Check if we should force fallback for testing
    const forceFallback = import.meta.env.VITE_FORCE_AI_FALLBACK === 'true';
    
    if (!huggingFaceApiKey || forceFallback) {
      console.warn('Missing Hugging Face API Key or fallback forced. Using mock analysis.');
      console.log('Make sure you have VITE_HUGGINGFACE_API_KEY in your .env file');
      
      // Add a visible property to the result to indicate it's a mock
      const mockResult = fallbackAnalysis(base64Image);
      mockResult.description = '[MOCK DATA] ' + mockResult.description;
      return mockResult;
    }

    console.log('Hugging Face API Key found, calling Hugging Face API...');
    
    // Convert base64 to binary data for the API
    const binaryData = Buffer.from(base64Image, 'base64');
    
    // Call Hugging Face image classification model
    // This uses the microsoft/resnet-50 model which is free to use
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/resnet-50',
      binaryData,
      {
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        responseType: 'json'
      }
    );

    console.log('Hugging Face API Response received:', {
      status: response.status,
      hasData: !!response.data,
      responseSize: JSON.stringify(response.data).length
    });

    // Process Hugging Face API response
    const result = processHuggingFaceResponse(response.data);
    console.log('Processed AI result:', result);
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Response details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.error('401 Unauthorized Error: Your Hugging Face API key is invalid.');
        console.error('1. Verify your API key is correct in .env file');
        console.error('2. Make sure you have created a valid API key on huggingface.co');
      }
    }
    // Fallback to mock analysis if the API call fails
    console.log('Falling back to mock analysis due to API error');
    return fallbackAnalysis(base64Image);
  }
};

function processHuggingFaceResponse(apiResponse: any[]): AIAnalysisResult {
  try {
    if (!Array.isArray(apiResponse) || apiResponse.length === 0) {
      throw new Error('Invalid API response format');
    }
    
    // Extract labels and confidences from the response
    const classifications = apiResponse;
    
    // Extract the most confident classifications (up to 5)
    const topClassifications = classifications.slice(0, 5);
    
    // Map detected objects/labels to civic categories
    const categoryMapping: Record<string, string> = {
      // Water related
      'water': 'Water',
      'lake': 'Water',
      'river': 'Water',
      'ocean': 'Water',
      'fountain': 'Water',
      'waterfall': 'Water',
      'puddle': 'Water',
      'flood': 'Water',
      'pipe': 'Water',
      'plumbing': 'Water',
      
      // Electricity related
      'light': 'Electricity',
      'lamp': 'Electricity',
      'bulb': 'Electricity',
      'streetlight': 'Electricity',
      'pole': 'Electricity',
      'wire': 'Electricity',
      'electric': 'Electricity',
      'power': 'Electricity',
      'transformer': 'Electricity',
      
      // Infrastructure related
      'road': 'Roads',
      'street': 'Roads',
      'highway': 'Roads',
      'path': 'Roads',
      'sidewalk': 'Roads',
      'pavement': 'Roads',
      'asphalt': 'Roads',
      'building': 'Infrastructure',
      'bridge': 'Infrastructure',
      'construction': 'Infrastructure',
      'architecture': 'Infrastructure',
      'wall': 'Infrastructure',
      'concrete': 'Infrastructure',
      
      // Sanitation related
      'garbage': 'Sanitation',
      'trash': 'Sanitation',
      'waste': 'Sanitation',
      'litter': 'Sanitation',
      'bin': 'Sanitation',
      'dump': 'Sanitation',
      'debris': 'Sanitation',
      'dirt': 'Sanitation'
    };
    
    // Find the most likely civic category based on classifications
    let bestCategory = 'Others';
    let bestCategoryScore = 0;
    
    for (const classification of topClassifications) {
      const label = classification.label.toLowerCase();
      const score = classification.score;
      
      for (const [keyword, category] of Object.entries(categoryMapping)) {
        if (label.includes(keyword) || keyword.includes(label)) {
          if (score > bestCategoryScore) {
            bestCategory = category;
            bestCategoryScore = score;
          }
        }
      }
    }
    
    // Generate a title based on the category and top classification
    let title = '';
    const topLabel = topClassifications[0]?.label || '';
    
    if (bestCategory === 'Water') {
      if (topLabel.toLowerCase().includes('leak') || topLabel.toLowerCase().includes('pipe')) {
        title = 'Water Leakage';
      } else if (topLabel.toLowerCase().includes('flood')) {
        title = 'Water Flooding';
      } else {
        title = 'Water Issue';
      }
    } else if (bestCategory === 'Electricity') {
      if (topLabel.toLowerCase().includes('light') || topLabel.toLowerCase().includes('lamp')) {
        title = 'Streetlight Issue';
      } else if (topLabel.toLowerCase().includes('power')) {
        title = 'Power Issue';
      } else {
        title = 'Electrical Problem';
      }
    } else if (bestCategory === 'Roads') {
      if (topLabel.toLowerCase().includes('pothole')) {
        title = 'Road Pothole';
      } else {
        title = 'Road Issue';
      }
    } else if (bestCategory === 'Sanitation') {
      if (topLabel.toLowerCase().includes('garbage') || topLabel.toLowerCase().includes('trash')) {
        title = 'Garbage Disposal Issue';
      } else {
        title = 'Sanitation Problem';
      }
    } else {
      title = 'Infrastructure Issue';
    }
    
    // Generate a description based on the classifications
    const labelDescriptions = topClassifications.map(c => `${c.label} (${(c.score * 100).toFixed(1)}%)`);
    const description = `AI detected: ${labelDescriptions.join(', ')}`;
    
    return {
      title,
      category: bestCategory,
      description,
      confidence: topClassifications[0]?.score || 0.8
    };
  } catch (error) {
    console.error('Error processing Hugging Face response:', error);
    // Return a generic result if parsing fails
    return {
      title: 'Civic Issue Detected',
      category: 'Others',
      description: 'An issue was detected but could not be classified automatically. Please provide more details.',
      confidence: 0.5
    };
  }
}

// Fallback mock analysis for when the API is unavailable or fails
function fallbackAnalysis(base64Image: string): AIAnalysisResult {
  // Simple mock implementation that uses image data length as a deterministic way to choose responses
  const mockResponses = [
    {
      title: 'Streetlight not working',
      category: 'Electricity',
      description: 'A streetlight appears to be malfunctioning or not illuminating properly.',
      confidence: 0.92
    },
    {
      title: 'Water leakage',
      category: 'Water',
      description: 'There is a water pipe leakage that needs immediate attention.',
      confidence: 0.89
    },
    {
      title: 'Damaged road/pothole',
      category: 'Roads',
      description: 'The road surface is damaged with a significant pothole that poses risk to vehicles.',
      confidence: 0.95
    },
    {
      title: 'Fallen tree branch',
      category: 'Infrastructure',
      description: 'A large tree branch has fallen and is blocking the pathway.',
      confidence: 0.87
    },
    {
      title: 'Overflowing garbage bin',
      category: 'Sanitation',
      description: 'Garbage bin is overflowing and needs to be collected.',
      confidence: 0.91
    }
  ];

  // Use image data to deterministically select a mock response
  const hashCode = base64Image.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const mockResult = mockResponses[hashCode % mockResponses.length];
  
  return mockResult;
}
