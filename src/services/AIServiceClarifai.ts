/**
 * Free AI Image Analysis Service using Clarifai
 * Clarifai offers a free tier with 5,000 operations per month
 */

import axios from 'axios';

// Clarifai API configuration
const CLARIFAI_API_KEY = import.meta.env.VITE_CLARIFAI_API_KEY || 'demo_key';
const CLARIFAI_MODEL_ID = 'general-image-recognition';
const CLARIFAI_MODEL_VERSION = 'aa7f35c01e0642fda5cf400f543e7c7f';

// Interface for AI analysis result
export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
}

/**
 * Analyze image using Clarifai's free API
 * @param imageData Base64 encoded image data
 * @returns Promise with analysis result
 */
export const analyzeImageWithClarifai = async (imageData: string): Promise<AIAnalysisResult> => {
  try {
    console.log('Starting Clarifai image analysis...');

    // Convert base64 to blob for Clarifai API
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBlob = base64ToBlob(base64Data, 'image/jpeg');

    // Create FormData for Clarifai API
    const formData = new FormData();
    formData.append('image', imageBlob);

    // Call Clarifai API
    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/versions/${CLARIFAI_MODEL_VERSION}/outputs`,
      {
        inputs: [{
          data: {
            image: {
              base64: base64Data
            }
          }
        }]
      },
      {
        headers: {
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.outputs && response.data.outputs[0]) {
      const concepts = response.data.outputs[0].data.concepts;
      return processClarifaiResults(concepts);
    }

    throw new Error('Invalid response from Clarifai API');

  } catch (error) {
    console.error('Clarifai API error:', error);
    throw error;
  }
};

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Process Clarifai API results into CivicGo format
 */
function processClarifaiResults(concepts: any[]): AIAnalysisResult {
  // Map Clarifai concepts to civic categories
  const categoryMapping: Record<string, string> = {
    // Water related
    'water': 'Water',
    'pipe': 'Water',
    'leak': 'Water',
    'flood': 'Water',
    'fountain': 'Water',
    'puddle': 'Water',
    'river': 'Water',
    'lake': 'Water',

    // Electricity related
    'light': 'Electricity',
    'lamp': 'Electricity',
    'bulb': 'Electricity',
    'streetlight': 'Electricity',
    'electric': 'Electricity',
    'power': 'Electricity',
    'wire': 'Electricity',
    'cable': 'Electricity',

    // Infrastructure related
    'road': 'Roads',
    'street': 'Roads',
    'building': 'Infrastructure',
    'bridge': 'Infrastructure',
    'construction': 'Infrastructure',
    'wall': 'Infrastructure',
    'house': 'Infrastructure',

    // Sanitation related
    'garbage': 'Sanitation',
    'trash': 'Sanitation',
    'waste': 'Sanitation',
    'bin': 'Sanitation',
    'litter': 'Sanitation',
    'dumpster': 'Sanitation'
  };

  // Find the most relevant civic category
  let bestCategory = 'Others';
  let bestScore = 0;
  let topConcepts = concepts.slice(0, 5); // Top 5 concepts

  for (const concept of topConcepts) {
    const name = concept.name.toLowerCase();
    const score = concept.value;

    for (const [keyword, category] of Object.entries(categoryMapping)) {
      if (name.includes(keyword) || keyword.includes(name)) {
        if (score > bestScore) {
          bestCategory = category;
          bestScore = score;
        }
      }
    }
  }

  // Generate title based on category and top concept
  const topConcept = topConcepts[0]?.name || '';
  let title = generateTitle(bestCategory, topConcept);

  // Generate description
  const conceptDescriptions = topConcepts.map(c =>
    `${c.name} (${(c.value * 100).toFixed(1)}%)`
  );
  const description = `AI detected: ${conceptDescriptions.join(', ')}`;

  return {
    title,
    category: bestCategory,
    description,
    confidence: topConcepts[0]?.value || 0.5
  };
}

/**
 * Generate appropriate title based on category and detected object
 */
function generateTitle(category: string, topConcept: string): string {
  const concept = topConcept.toLowerCase();

  switch (category) {
    case 'Water':
      if (concept.includes('leak') || concept.includes('pipe')) return 'Water Leakage';
      if (concept.includes('flood')) return 'Water Flooding';
      return 'Water Issue';

    case 'Electricity':
      if (concept.includes('light') || concept.includes('lamp')) return 'Streetlight Issue';
      if (concept.includes('power')) return 'Power Issue';
      return 'Electrical Problem';

    case 'Roads':
      if (concept.includes('pothole') || concept.includes('damage')) return 'Road Damage';
      return 'Road Issue';

    case 'Sanitation':
      if (concept.includes('garbage') || concept.includes('trash')) return 'Garbage Disposal Issue';
      return 'Sanitation Problem';

    case 'Infrastructure':
      if (concept.includes('building')) return 'Building Issue';
      if (concept.includes('bridge')) return 'Bridge Problem';
      return 'Infrastructure Issue';

    default:
      return 'Civic Issue Detected';
  }
}

/**
 * Fallback mock analysis
 */
export const fallbackAnalysis = (imageData: string): AIAnalysisResult => {
  const mockResponses = [
    {
      title: 'Streetlight not working',
      category: 'Electricity',
      description: 'A streetlight appears to be malfunctioning.',
      confidence: 0.85
    },
    {
      title: 'Water leakage',
      category: 'Water',
      description: 'Water pipe leakage detected.',
      confidence: 0.82
    },
    {
      title: 'Road damage',
      category: 'Roads',
      description: 'Road surface damage or pothole.',
      confidence: 0.88
    },
    {
      title: 'Garbage overflow',
      category: 'Sanitation',
      description: 'Garbage bin is overflowing.',
      confidence: 0.80
    }
  ];

  const hash = imageData.length % mockResponses.length;
  return mockResponses[hash];
};
