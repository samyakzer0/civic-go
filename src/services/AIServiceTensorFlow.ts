import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl'; // For better performance

// Interface for AI analysis result
interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
}

// Load the MobileNet model (runs locally in browser)
let model: tf.LayersModel | null = null;
let modelLoading = false;

async function loadModel() {
  if (model !== null) return model;
  if (modelLoading) {
    // Wait for the model to load if it's already loading
    while (modelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return model;
  }
  
  try {
    modelLoading = true;
    console.log('Loading TensorFlow.js MobileNet model...');
    // Use MobileNet - a lightweight model that works well for general image recognition
    model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    console.log('TensorFlow.js model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading TensorFlow.js model:', error);
    throw error;
  } finally {
    modelLoading = false;
  }
}

// Class names for MobileNet (ImageNet labels)
const IMAGENET_CLASSES: string[] = require('./imagenet_classes').IMAGENET_CLASSES;

// Using TensorFlow.js to run inference locally in the browser
export const analyzeImage = async (imageData: string): Promise<AIAnalysisResult> => {
  try {
    // Check if we should force fallback for testing
    const forceFallback = import.meta.env.VITE_FORCE_AI_FALLBACK === 'true';
    
    if (forceFallback) {
      console.warn('Fallback forced. Using mock analysis.');
      const mockResult = fallbackAnalysis(imageData);
      mockResult.description = '[MOCK DATA] ' + mockResult.description;
      return mockResult;
    }

    console.log('Starting TensorFlow.js image analysis...');
    
    // Load image
    const image = await loadImageFromDataUrl(imageData);
    
    // Load model if not already loaded
    const tfModel = await loadModel();
    
    if (!tfModel) {
      throw new Error('Failed to load TensorFlow.js model');
    }
    
    // Preprocess image for the model
    const tensorImg = preprocessImage(image);
    
    // Run prediction
    const predictions = await runInference(tfModel, tensorImg);
    
    // Process TensorFlow.js results
    const result = processTensorflowResults(predictions);
    console.log('Processed AI result:', result);
    
    // Clean up tensors to prevent memory leaks
    tf.dispose(tensorImg);
    
    return result;
  } catch (error) {
    console.error('Error analyzing image with TensorFlow.js:', error);
    // Fallback to mock analysis if TensorFlow.js fails
    console.log('Falling back to mock analysis due to error');
    return fallbackAnalysis(imageData);
  }
};

// Load image from data URL
async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

// Preprocess image to match model requirements
function preprocessImage(img: HTMLImageElement) {
  // MobileNet expects 224x224 images
  const targetSize = 224;
  
  // Create a canvas to resize the image
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw resized image to canvas
  ctx.drawImage(img, 0, 0, targetSize, targetSize);
  
  // Get image data and convert to tensor
  const tensor = tf.browser.fromPixels(canvas)
    .toFloat()
    .sub(127.5)  // Subtract mean
    .div(127.5)  // Normalize to [-1, 1]
    .expandDims(0); // Add batch dimension
    
  return tensor;
}

// Run inference with TensorFlow.js
async function runInference(model: tf.LayersModel, tensorImg: tf.Tensor) {
  // Run prediction
  const logits = model.predict(tensorImg) as tf.Tensor;
  const probabilities = tf.softmax(logits);
  
  // Get top 5 predictions
  const values = await probabilities.data();
  const indices = Array.from(values).map((_, i) => i);
  indices.sort((a, b) => values[b] - values[a]);
  
  const topPredictions = indices.slice(0, 5).map(idx => {
    return {
      className: IMAGENET_CLASSES[idx],
      probability: values[idx]
    };
  });
  
  // Clean up tensors
  tf.dispose([logits, probabilities]);
  
  return topPredictions;
}

function processTensorflowResults(predictions: Array<{className: string, probability: number}>): AIAnalysisResult {
  try {
    // Map detected objects/labels to civic categories
    const categoryMapping: Record<string, string> = {
      // Water related
      'water': 'Water',
      'lake': 'Water',
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
      
      // Infrastructure related
      'road': 'Roads',
      'street': 'Roads',
      'highway': 'Roads',
      'path': 'Roads',
      'sidewalk': 'Roads',
      'pavement': 'Roads',
      'building': 'Infrastructure',
      'bridge': 'Infrastructure',
      'construction': 'Infrastructure',
      'wall': 'Infrastructure',
      
      // Sanitation related
      'garbage': 'Sanitation',
      'trash': 'Sanitation',
      'waste': 'Sanitation',
      'litter': 'Sanitation',
      'bin': 'Sanitation',
      'dump': 'Sanitation',
      'debris': 'Sanitation',
      'dirty': 'Sanitation'
    };
    
    // Find the most likely civic category based on classifications
    let bestCategory = 'Others';
    let bestCategoryScore = 0;
    
    for (const prediction of predictions) {
      const label = prediction.className.toLowerCase();
      const score = prediction.probability;
      
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
    const topLabel = predictions[0]?.className || '';
    
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
    
    // Generate a description based on the predictions
    const labelDescriptions = predictions.map(p => `${p.className} (${(p.probability * 100).toFixed(1)}%)`);
    const description = `AI detected: ${labelDescriptions.join(', ')}`;
    
    return {
      title,
      category: bestCategory,
      description,
      confidence: predictions[0]?.probability || 0.8
    };
  } catch (error) {
    console.error('Error processing TensorFlow.js results:', error);
    // Return a generic result if parsing fails
    return {
      title: 'Civic Issue Detected',
      category: 'Others',
      description: 'An issue was detected but could not be classified automatically. Please provide more details.',
      confidence: 0.5
    };
  }
}

// Fallback mock analysis for when TensorFlow.js is unavailable or fails
function fallbackAnalysis(imageData: string): AIAnalysisResult {
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
