import { supabase } from './supabase.ts';
import { v4 as uuidv4 } from 'uuid';

// Report data model
export interface ReportData {
  report_id: string;
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image_url: string;
  status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved';
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ReportSubmissionResponse {
  success: boolean;
  report_id: string;
  message: string;
}

// Generate a unique reference number for each report
// Format: CG-{Category Prefix}-{Date}-{Random Number}
export const generateReferenceNumber = (category: string): string => {
  const categoryPrefixes: { [key: string]: string } = {
    'Water': 'WT',
    'Electricity': 'EL',
    'Infrastructure': 'IN',
    'Sanitation': 'SN',
    'Roads': 'RD',
    'Streetlights': 'EL', // Grouping streetlights under Electricity
    'Others': 'OT'
  };

  const prefix = categoryPrefixes[category] || 'OT';
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `CG-${prefix}-${dateStr}-${randomNum}`;
};

// Convert image data URL to a file and upload it to Supabase Storage
const uploadImage = async (imageData: string, reportId: string): Promise<string> => {
  try {
    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    
    // Upload to Supabase Storage
    const fileName = `${reportId}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(`public/${fileName}`, blob);
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(`public/${fileName}`);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Fallback to returning a placeholder URL
    return `https://storage.civicgo.example/uploads/${Date.now()}.jpg`;
  }
};

// Get user's current location
export const getCurrentLocation = (): Promise<{ lat: number, lng: number, address: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Try to get address using Google Maps API if available
          const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (googleMapsApiKey) {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${googleMapsApiKey}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: data.results[0].formatted_address
              });
              return;
            }
          }
          
          // Fallback to just coordinates
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`
          });
        } catch (error) {
          // If geocoding fails, still return the coordinates
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`
          });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Submit a report to Supabase
export const submitReport = async (
  title: string,
  description: string,
  category: string,
  location: { lat: number, lng: number, address: string },
  imageData: string | null,
  userId: string = 'anon_user' // Default for anonymous users
): Promise<ReportSubmissionResponse> => {
  try {
    const reportId = generateReferenceNumber(category);
    const timestamp = new Date().toISOString();
    
    // Upload image if available
    let imageUrl = '';
    if (imageData) {
      imageUrl = await uploadImage(imageData, reportId);
    }

    const reportData = {
      report_id: reportId,
      title,
      description,
      category,
      location,
      image_url: imageUrl,
      status: 'Submitted',
      created_at: timestamp,
      updated_at: timestamp,
      user_id: userId
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to submit report: ${error.message}`);
    }
    
    // Fallback to local storage if Supabase is not configured yet
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const existingReports = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
      existingReports.push(reportData);
      localStorage.setItem('civicgo_reports', JSON.stringify(existingReports));
    }

    // Return response
    return {
      success: true,
      report_id: reportId,
      message: 'Report submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
};

// Get all reports for the current user
export const getUserReports = async (userId: string = 'anon_user'): Promise<ReportData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReportData[];
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
    return allReports.filter(report => report.user_id === userId);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
      return allReports.filter(report => report.user_id === userId);
    } catch {
      return [];
    }
  }
};

// Get all reports for admin by category
export const getReportsByCategory = async (category: string): Promise<ReportData[]> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReportData[];
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
    return allReports.filter(report => report.category === category);
  } catch (error) {
    console.error('Error fetching category reports:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
      return allReports.filter(report => report.category === category);
    } catch {
      return [];
    }
  }
};

// Get a specific report by ID
export const getReportById = async (reportId: string): Promise<ReportData | null> => {
  try {
    // Try to get from Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('report_id', reportId)
        .single();
      
      if (error) throw error;
      return data as ReportData;
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
    const report = allReports.find(r => r.report_id === reportId);
    return report || null;
  } catch (error) {
    console.error('Error fetching report:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
      const report = allReports.find(r => r.report_id === reportId);
      return report || null;
    } catch {
      return null;
    }
  }
};

// Update a report's status
export const updateReportStatus = async (reportId: string, status: 'Submitted' | 'In Review' | 'Forwarded' | 'Resolved'): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    
    // Try to update in Supabase first
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          updated_at: timestamp
        })
        .eq('report_id', reportId);
      
      if (error) throw error;
      return true;
    }
    
    // Fallback to localStorage
    const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
    const reportIndex = allReports.findIndex(r => r.report_id === reportId);
    
    if (reportIndex === -1) return false;
    
    allReports[reportIndex].status = status;
    allReports[reportIndex].updated_at = timestamp;
    
    localStorage.setItem('civicgo_reports', JSON.stringify(allReports));
    return true;
  } catch (error) {
    console.error('Error updating report status:', error);
    
    // Final fallback
    try {
      const allReports: ReportData[] = JSON.parse(localStorage.getItem('civicgo_reports') || '[]');
      const reportIndex = allReports.findIndex(r => r.report_id === reportId);
      
      if (reportIndex === -1) return false;
      
      allReports[reportIndex].status = status;
      allReports[reportIndex].updated_at = new Date().toISOString();
      
      localStorage.setItem('civicgo_reports', JSON.stringify(allReports));
      return true;
    } catch {
      return false;
    }
  }
};
