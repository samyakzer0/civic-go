# OpenCage Geocoding Setup

## 🚀 **OpenCage Geocoder Integration with Major City Priority**

Your CivicGo app now uses **OpenCage Geocoder** for accurate city detection with **smart major city prioritization**!

### 🎯 **New Features:**

- ✅ **Major City Priority:** Automatically detects nearest major city within 50km
- ✅ **Rural Area Support:** Small towns/villages return nearest big city
- ✅ **30 Major Cities:** Pre-configured with accurate coordinates
- ✅ **Distance Calculation:** Haversine formula for precise distance measurement

### 📋 **How It Works:**

1. **Geocodes your location** using OpenCage API
2. **Calculates distance** to all major cities
3. **Returns nearest major city** if within 50km
4. **Falls back to local city/town** if outside major city radius
5. **Maintains accuracy** for both urban and rural areas

### 🏙️ **Supported Major Cities:**

**India:** Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad, Pune, Indore, Jaipur, Lucknow, Kanpur, Nagpur, Thane, Bhopal, Visakhapatnam, Patna, Vadodara, Ludhiana, Agra

**International:** New York, London, Tokyo, Shanghai, Paris, Singapore, Dubai, Sydney, Toronto, Berlin

### 🧪 **Testing:**

Run the test script to verify major city detection:
```bash
# Test with various locations
node src/test-geocoding.ts
```

**Expected Results:**
- Major cities: Returns exact city name
- Rural areas: Returns nearest major city
- Remote areas: Returns local town/city name

### 🔧 **API Priority:**

1. **OpenCage Geocoder** (Primary - Most Accurate)
2. **BigDataCloud** (Fallback)
3. **OpenStreetMap Nominatim** (Final Fallback)

### 🐛 **Debugging:**

Check your browser's developer console for:
- Detected city name
- Full address information
- API response details
- Any error messages

### 📊 **Rate Limits:**

- **OpenCage Free:** 2,500 requests/day
- **BigDataCloud:** No daily limit mentioned
- **OpenStreetMap:** No daily limit (but has hourly limits)

Happy geocoding! 🗺️
