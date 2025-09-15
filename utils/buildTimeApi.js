import axios from 'axios';
import { apiUrl } from '../config';

/**
 * Utility function for making API calls during build time with proper error handling
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} fallbackData - Data to return if API call fails
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<Object>} - Returns the API response or fallback data
 */
export async function buildTimeApiCall(endpoint, fallbackData, timeout = 5000) {
  if (!apiUrl) {
    console.warn('NEXT_PUBLIC_API_URL is not set; returning fallback content.');
    return {
      props: {
        appData: fallbackData
      },
      revalidate: 60
    };
  }

  try {
    const { data } = await axios.get(`${apiUrl}${endpoint}`, {
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return {
      props: {
        appData: data?.appData ?? fallbackData
      },
      revalidate: 3600
    };
  } catch (error) {
    console.warn(`Failed to fetch content from ${endpoint} during build:`, error.message);
    return {
      props: {
        appData: fallbackData
      },
      revalidate: 60 // Retry more frequently on error
    };
  }
}

/**
 * Predefined fallback content for different page types
 */
export const fallbackContent = {
  about: {
    description: "<p>Welcome to Aromashore - your premier destination for luxury fragrances and aromatherapy products.</p>"
  },
  faq: {
    description: "<p>Frequently asked questions will be loaded from the backend when available.</p>"
  },
  privacy: {
    description: "<p>Privacy policy will be loaded from the backend when available.</p>"
  },
  terms: {
    description: "<p>Terms and conditions will be loaded from the backend when available.</p>"
  },
  returnPolicy: {
    description: "<p>Our return policy will be loaded from the backend when available. Please contact us for any return-related inquiries.</p>"
  }
};
