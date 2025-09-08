import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Mic, MapPin, Camera, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import AIAnalysis from './AIAnalysis';
import LocationMap from './LocationMap';
import ReportConfirmationModal from './ReportConfirmationModal';
import { analyzeImage } from '../services/AIService';
import { getCurrentLocation, submitReport, getCityList } from '../services/ReportService';

interface ReportPageProps {
  onNavigate: (page: string) => void;
  cameraActive?: boolean;
  userId?: string;
}

function ReportPage({ onNavigate, cameraActive = false, userId = 'anon_user' }: ReportPageProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number, address: string, city: string }>({
    lat: 28.6139, 
    lng: 77.2090, 
    address: 'Connaught Place, New Delhi, India',
    city: 'New Delhi'
  });
  const [cityInput, setCityInput] = useState('');
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  // UI states
  const { theme, language } = useTheme();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    title: string;
    category: string;
    description: string;
    confidence: number;
  } | null>(null);
  
  // Location states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  
  // Report submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('');
  
  // Categories supported by the app
  const categories = ['Water', 'Electricity', 'Infrastructure', 'Sanitation', 'Roads', 'Others'];

  // Fetch the list of cities for autocomplete
  const fetchCities = async () => {
    try {
      const cities = await getCityList();
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  };

  useEffect(() => {
    // Check if camera should be activated automatically
    if (cameraActive) {
      setTimeout(() => {
        activateCamera();
      }, 500); // Small delay to ensure component is fully mounted
    }
    
    // Check if there's a captured image from the camera button
    const capturedImageData = localStorage.getItem('capturedImage');
    if (capturedImageData) {
      setImage(capturedImageData);
      localStorage.removeItem('capturedImage'); // Clear it after loading
      
      // Analyze the captured image with AI
      analyzeWithAI(capturedImageData);
    }
    
    // Try to get user's current location when component mounts
    fetchCurrentLocation();
    
    // Clean up file input when component unmounts
    return () => {
      // No cleanup needed for native camera
    };
  }, [cameraActive]);

  // Handle city input changes and show suggestions
  const handleCityInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    
    if (value.length > 1) {
      const cities = await fetchCities();
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setSuggestedCities(filtered);
      setShowCitySuggestions(filtered.length > 0);
    } else {
      setSuggestedCities([]);
      setShowCitySuggestions(false);
    }
  };

  // Select a city from suggestions
  const selectCity = (city: string) => {
    setCityInput(city);
    setLocation({...location, city});
    setShowCitySuggestions(false);
  };

  const fetchCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      // Update the city input field with the detected city
      setCityInput(currentLocation.city);
    } catch (error) {
      console.error('Error fetching location:', error);
      // Keep default location in case of error
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const activateCamera = async () => {
    // Use native camera app instead of in-page camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        
        // Analyze the captured image with AI
        analyzeWithAI(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        
        // Analyze the uploaded image with AI
        analyzeWithAI(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithAI = async (imageData: string) => {
    try {
      setIsAnalyzing(true);
      console.log("Starting image analysis with Cloud Vision API...");
      
      const result = await analyzeImage(imageData);
      console.log("AI analysis result:", result);
      
      setAiResult(result);
      
      // Pre-fill the form with AI suggestions
      setTitle(result.title);
      setCategory(result.category);
      setDescription(result.description);
      
      console.log("Form pre-filled with AI suggestions");
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Don't set the AI result if there's an error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAI = () => {
    // AI suggestions already applied to form, just acknowledge
    // This could show a confirmation toast or animation
    setAiResult(null); // Hide the AI component
  };

  const handleRejectAI = () => {
    // Clear the AI suggestions
    setAiResult(null);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit the report
      const response = await submitReport(
        title,
        description,
        category,
        location,
        image,
        userId
      );
      
      if (response.success) {
        setSubmittedReportId(response.report_id);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (newLocation: { lat: number, lng: number, address: string }) => {
    // Preserve the city when updating location
    setLocation({...newLocation, city: location.city});
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.reportIssue}</h1>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-2xl mx-auto">
        <form className="space-y-6">
          {/* Image Upload - Moved to top for better user flow */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.imageUpload}
              </label>
              {!image && (
                <button 
                  type="button" 
                  onClick={activateCamera}
                  className={`flex items-center gap-1 text-sm ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  <Camera size={16} />
                  <span>{t.takePhoto}</span>
                </button>
              )}
            </div>
            
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded"
                  className={`w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setAiResult(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-48 sm:h-64 md:h-80 border-2 border-dashed ${
                theme === 'dark'
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              } rounded-xl cursor-pointer transition-colors`}>
                <Upload className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
                <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Upload a file</span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>or drag and drop</span>
                <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>PNG, JPG, GIF up to 10MB</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
            
            {/* Hidden file input for native camera capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
          </div>
          
          {/* AI Analysis results */}
          {(isAnalyzing || aiResult) && (
            <AIAnalysis 
              isAnalyzing={isAnalyzing}
              result={aiResult}
              onAccept={handleAcceptAI}
              onReject={handleRejectAI}
            />
          )}

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.title}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.title}
              className={`w-full p-4 ${
                theme === 'dark' 
                  ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                  : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
              } border rounded-xl focus:ring-2 focus:border-transparent transition-all`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.briefDescription}
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.briefDescription}
                rows={4}
                className={`w-full p-4 ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
                } border rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none`}
              />
              <button
                type="button"
                className={`absolute bottom-4 right-4 p-2 ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:bg-gray-700'
                    : 'text-blue-600 hover:bg-blue-50'
                } rounded-lg transition-colors`}
              >
                <Mic size={20} />
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full p-4 ${
                theme === 'dark' 
                  ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                  : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
              } border rounded-xl focus:ring-2 focus:border-transparent transition-all appearance-none`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.location}
              </label>
              <button
                type="button"
                onClick={fetchCurrentLocation}
                className={`flex items-center gap-1 text-sm ${
                  theme === 'dark' 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'
                } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                <span>{t.useLocation}</span>
              </button>
            </div>
            
            {/* City Input with Autocomplete */}
            <div className="mb-4 relative">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                City
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={handleCityInputChange}
                placeholder="Enter your city"
                className={`w-full p-4 ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
                } border rounded-xl focus:ring-2 focus:border-transparent transition-all`}
                onFocus={() => setShowCitySuggestions(suggestedCities.length > 0)}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => setShowCitySuggestions(false), 200);
                  // Update location with the entered city
                  if (cityInput) {
                    setLocation({...location, city: cityInput});
                  }
                }}
              />
              
              {/* City suggestions dropdown */}
              {showCitySuggestions && (
                <div className={`absolute z-10 w-full mt-1 py-1 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border rounded-md shadow-lg`}>
                  {suggestedCities.map((city, index) => (
                    <div 
                      key={index} 
                      className={`px-4 py-2 cursor-pointer ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => selectCity(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Location Map */}
            <div 
              onClick={() => setShowLocationMap(!showLocationMap)}
              className="mb-2 cursor-pointer"
            >
              <LocationMap 
                location={location} 
                onLocationChange={handleLocationChange} 
                editable={showLocationMap}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowLocationMap(!showLocationMap)}
                className={`text-sm ${
                  theme === 'dark' 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                {showLocationMap ? t.confirmSubmit : t.changeLocation}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !description || !category}
            className={`w-full ${
              theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${(isSubmitting || !title || !description || !category) ? 'opacity-60 cursor-not-allowed' : ''} text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg flex items-center justify-center gap-2`}
          >
            {isSubmitting && <Loader2 size={20} className="animate-spin" />}
            {isSubmitting ? t.processingImage : t.submitReport}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ReportConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          onNavigate('home');
        }}
        reportId={submittedReportId}
        onViewStatus={() => {
          setShowConfirmation(false);
          onNavigate('status');
        }}
      />
    </div>
  );
}

export default ReportPage;