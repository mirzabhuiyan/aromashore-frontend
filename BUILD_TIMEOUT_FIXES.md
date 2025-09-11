# Build Timeout Fixes Documentation

## Problem Summary
The build process was failing due to timeout issues during static page generation, specifically for the `/return-policy` page. The error indicated a connection timeout (ETIMEDOUT) when trying to connect to the backend service at 172.66.0.96:3303.

## Root Causes Identified
1. **Build timeout**: The build process exceeded the 60-second limit during static generation
2. **Slow data fetching**: API calls during build time were taking too long or failing
3. **Backend connectivity issues**: Frontend couldn't connect to backend service within allowed time

## Solutions Implemented

### 1. Updated Next.js Configuration (`next.config.js`)
- **Increased build timeout**: Set `staticPageGenerationTimeout: 120` (2 minutes instead of 60 seconds)
- **Added webpack timeout**: Increased server-side operation timeout to 2 minutes
- **Added experimental optimizations**: Enabled CSS optimization for better performance

### 2. Fixed Return Policy Page (`pages/return-policy.jsx`)
- **Added proper timeout handling**: 5-second timeout for API calls
- **Implemented fallback strategy**: Returns static content when backend is unavailable during build
- **Added production build detection**: Skips API calls during production builds when backend is not localhost
- **Added revalidation**: 1-hour revalidation for successful calls, 1-minute for failed calls

### 3. Created Utility Function (`utils/buildTimeApi.js`)
- **Standardized API calls**: Centralized function for build-time API calls with proper error handling
- **Predefined fallback content**: Common fallback content for different page types
- **Configurable timeouts**: Customizable timeout per API call
- **Environment detection**: Automatically handles production vs development environments

### 4. Enhanced Build Scripts
- **Added robust build script**: `scripts/build-with-fallback.js` with comprehensive error handling
- **Updated package.json**: Added `build:robust` script for production builds
- **Memory optimization**: Increased Node.js memory limit to 4GB
- **Fallback build strategy**: Attempts fallback build if main build times out

## Files Modified
1. `next.config.js` - Increased timeouts and added optimizations
2. `pages/return-policy.jsx` - Fixed API call handling with proper timeouts
3. `utils/buildTimeApi.js` - New utility for standardized build-time API calls
4. `scripts/build-with-fallback.js` - New robust build script
5. `package.json` - Added new build script

## Deployment Instructions

### Option 1: Use the Robust Build Script (Recommended)
```bash
npm run build:robust
```

### Option 2: Use Standard Build with Updated Configuration
```bash
npm run build
```

### Option 3: Use Production Build
```bash
npm run build:production
```

## Environment Variables Required
Make sure these environment variables are set:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_BACKEND_DOMAIN`: Backend domain
- `NODE_ENV`: Set to 'production' for production builds

## Monitoring and Troubleshooting

### Build Success Indicators
- ✅ Build completed successfully!
- ✅ Fallback build completed successfully!

### Common Issues and Solutions

1. **Still getting timeouts?**
   - Check if backend service is running and accessible
   - Verify network connectivity between build environment and backend
   - Consider using the fallback build strategy

2. **API calls failing during build?**
   - The system will automatically fall back to static content
   - Check backend logs for any issues
   - Verify API endpoints are working correctly

3. **Memory issues during build?**
   - The build script automatically sets Node.js memory limit to 4GB
   - If still having issues, increase `--max-old-space-size` in the build script

## Testing the Fixes

### Local Testing
```bash
# Test with local backend
NEXT_PUBLIC_API_URL=http://localhost:3303 npm run build

# Test with production backend
NEXT_PUBLIC_API_URL=https://aroma-shore-backend-dirk7.ondigitalocean.app:3303 npm run build:robust
```

### Production Testing
```bash
# Use the robust build script
npm run build:robust
```

## Additional Recommendations

1. **Backend Optimization**: Ensure backend API responses are optimized for quick responses
2. **Caching**: Consider implementing Redis caching for frequently accessed data
3. **CDN**: Use a CDN for static assets to improve build performance
4. **Monitoring**: Set up monitoring for build processes to catch issues early

## Support
If you continue to experience build issues after implementing these fixes, check:
1. Backend service status and response times
2. Network connectivity between build environment and backend
3. Backend API endpoint availability and performance
4. Environment variable configuration
