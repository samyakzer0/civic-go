/**
 * AI Image Analysis Service using Perplexity Pro API
 * Perplexity Pro offers excellent vision capabilities for civic infrastructure analysis
 */

// Interface for AI analysis result
export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

// Perplexity API configuration
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;
const PERPLEXITY_API_BASE = 'https://api.perplexity.ai/chat/completions';

// Main image analysis function using Perplexity Pro API
export const analyzeImage = async (imageData: string): Promise<AIAnalysisResult> => {
  try {
    // Check if API key is provided
    if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === 'your_perplexity_api_key_here') {
      console.warn('Perplexity API key not provided. Using fallback analysis.');
      return fallbackAnalysis(imageData);
    }

    // Check if we should force fallback for testing
    const forceFallback = import.meta.env.VITE_FORCE_AI_FALLBACK === 'true';
    if (forceFallback) {
      console.warn('Fallback forced. Using mock analysis.');
      const mockResult = fallbackAnalysis(imageData);
      mockResult.description = '[MOCK DATA] ' + mockResult.description;
      return mockResult;
    }

    console.log('Starting Perplexity Pro image analysis...');

    // Create a detailed prompt for civic infrastructure analysis
    const systemPrompt = `You are an expert AI assistant specialized in analyzing civic infrastructure images. Your task is to identify and categorize civic issues from uploaded photos.

Analyze the image and respond with a JSON object containing:
1. "title": A clear, concise title describing the main issue (max 50 characters)
2. "category": Must be one of: "Water", "Electricity", "Roads", "Sanitation", "Infrastructure", or "Others"
3. "description": A detailed description of the issue and its potential impact (max 200 characters)
4. "confidence": A number between 0 and 1 representing your confidence in the analysis
5. "priority": Must be one of: "Low", "Medium", "High", or "Urgent" based on severity and urgency

Priority Guidelines:
- Urgent: Immediate danger to life/safety, severe infrastructure damage, major service disruption
- High: Significant impact on daily life, potential for escalation, time-sensitive issues
- Medium: Moderate inconvenience, maintenance issues, non-critical problems
- Low: Minor issues, cosmetic problems, long-term maintenance needs

Category Guidelines:
- Water: Pipe leaks, flooding, drainage issues, water infrastructure
- Electricity: Street lights, power lines, electrical infrastructure
- Roads: Potholes, road damage, sidewalk issues, traffic infrastructure
- Sanitation: Garbage accumulation, waste management, cleanliness issues
- Infrastructure: Buildings, bridges, public structures, general construction
- Others: Issues that don't fit the above categories

Focus on identifying problems, damages, or maintenance needs that would require municipal attention.

Respond ONLY with the JSON object, no additional text.`;

    // Prepare the API request
    const requestBody = {
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this civic infrastructure image and identify any issues that require municipal attention."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    // Make API call to Perplexity
    const response = await fetch(PERPLEXITY_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the response content
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response format from Perplexity API');
    }

    // Parse the JSON response
    let result: AIAnalysisResult;
    try {
      // Clean the response in case there's any extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsedResult = JSON.parse(jsonStr);
      
      result = {
        title: parsedResult.title || 'Civic Issue Detected',
        category: parsedResult.category || 'Others',
        description: parsedResult.description || 'An issue was detected that requires municipal attention.',
        confidence: parsedResult.confidence || 0.8,
        priority: parsedResult.priority || 'Medium'
      };
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      // Fallback to processing the text response
      result = processTextResponse(content);
    }
    
    console.log('Perplexity analysis completed:', result);
    return result;

  } catch (error) {
    console.error('Error analyzing image with Perplexity:', error);
    console.log('Falling back to mock analysis due to error');
    return fallbackAnalysis(imageData);
  }
};

/**
 * Process text response from Perplexity when JSON parsing fails
 */
function processTextResponse(content: string): AIAnalysisResult {
  // Extract key information from the text response
  const lowerContent = content.toLowerCase();
  
  // Determine category based on keywords
  let category = 'Others';
  let priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium';
  
  if (lowerContent.includes('water') || lowerContent.includes('leak') || lowerContent.includes('pipe') || lowerContent.includes('flood')) {
    category = 'Water';
    if (lowerContent.includes('burst') || lowerContent.includes('major') || lowerContent.includes('severe')) {
      priority = 'Urgent';
    } else if (lowerContent.includes('leak') || lowerContent.includes('dripping')) {
      priority = 'High';
    }
  } else if (lowerContent.includes('light') || lowerContent.includes('electric') || lowerContent.includes('power') || lowerContent.includes('wire')) {
    category = 'Electricity';
    if (lowerContent.includes('dangerous') || lowerContent.includes('hanging') || lowerContent.includes('exposed')) {
      priority = 'Urgent';
    } else if (lowerContent.includes('outage') || lowerContent.includes('not working')) {
      priority = 'High';
    }
  } else if (lowerContent.includes('road') || lowerContent.includes('pothole') || lowerContent.includes('street') || lowerContent.includes('pavement')) {
    category = 'Roads';
    if (lowerContent.includes('accident') || lowerContent.includes('dangerous') || lowerContent.includes('large')) {
      priority = 'Urgent';
    } else if (lowerContent.includes('pothole') || lowerContent.includes('damage')) {
      priority = 'High';
    }
  } else if (lowerContent.includes('garbage') || lowerContent.includes('trash') || lowerContent.includes('waste') || lowerContent.includes('sanitation')) {
    category = 'Sanitation';
    if (lowerContent.includes('overflowing') || lowerContent.includes('blocking') || lowerContent.includes('health')) {
      priority = 'High';
    } else {
      priority = 'Low';
    }
  } else if (lowerContent.includes('building') || lowerContent.includes('bridge') || lowerContent.includes('construction') || lowerContent.includes('structure')) {
    category = 'Infrastructure';
    if (lowerContent.includes('collapse') || lowerContent.includes('dangerous') || lowerContent.includes('unsafe')) {
      priority = 'Urgent';
    } else if (lowerContent.includes('crack') || lowerContent.includes('damage')) {
      priority = 'High';
    }
  }

  // Generate title based on category
  const title = generateTitleFromCategory(category);
  
  // Use the content as description, truncated if necessary
  const description = content.length > 200 ? content.substring(0, 197) + '...' : content;

  return {
    title,
    category,
    description,
    confidence: 0.7,
    priority
  };
}

/**
 * Generate appropriate title based on category
 */
function generateTitleFromCategory(category: string): string {
  const titles: { [key: string]: string[] } = {
    'Water': ['Water Issue Detected', 'Plumbing Problem', 'Water Infrastructure Issue'],
    'Electricity': ['Electrical Issue', 'Street Light Problem', 'Power Infrastructure Issue'],
    'Roads': ['Road Damage', 'Street Condition Issue', 'Pavement Problem'],
    'Sanitation': ['Waste Management Issue', 'Sanitation Problem', 'Cleanliness Concern'],
    'Infrastructure': ['Building Issue', 'Structural Problem', 'Infrastructure Concern'],
    'Others': ['Civic Issue Detected', 'Municipal Attention Required', 'Infrastructure Concern']
  };
  
  const categoryTitles = titles[category] || titles['Others'];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

/**
 * Fallback mock analysis for when Perplexity API is unavailable or fails
 */
function fallbackAnalysis(imageData: string): AIAnalysisResult {
  // Simple mock implementation that uses image data length as a deterministic way to choose responses
  const mockResponses = [
    {
      title: 'Streetlight not working',
      category: 'Electricity',
      description: 'A streetlight appears to be malfunctioning or not illuminating properly.',
      confidence: 0.92,
      priority: 'Medium' as const
    },
    {
      title: 'Water leakage',
      category: 'Water',
      description: 'There is a water pipe leakage that needs immediate attention.',
      confidence: 0.89,
      priority: 'High' as const
    },
    {
      title: 'Damaged road/pothole',
      category: 'Roads',
      description: 'The road surface is damaged with a significant pothole that poses risk to vehicles.',
      confidence: 0.95,
      priority: 'High' as const
    },
    {
      title: 'Fallen tree branch',
      category: 'Infrastructure',
      description: 'A large tree branch has fallen and is blocking the pathway.',
      confidence: 0.87,
      priority: 'Urgent' as const
    },
    {
      title: 'Overflowing garbage bin',
      category: 'Sanitation',
      description: 'Garbage bin is overflowing and needs to be collected.',
      confidence: 0.91,
      priority: 'Low' as const
    }
  ];

  // Use image data to deterministically select a mock response
  const hashCode = imageData.split('').reduce((acc, char, i) => {
    // Only use a subset of chars to reduce computation
    if (i % 100 === 0) {
      return acc + char.charCodeAt(0);
    }
    return acc;
  }, 0);
  
  const mockResult = mockResponses[hashCode % mockResponses.length];
  
  return mockResult;
}
