// services/apiCall.js

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Get authorization token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('access');
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }
  
  return data;
};

/**
 * Submit initial orientation data (serie_bac + releve_note)
 * @param {string} serieBac - Serie du baccalauréat (S, C, D, A1, L, OSE)
 * @param {File} releveNote - Image file of the transcript
 * @returns {Promise<Object>} Response with session_id, analyse_initiale, and questions
 */
export const submitInitialOrientation = async (serieBac, releveNote) => {
  try {
    const formData = new FormData();
    formData.append('serie_bac', serieBac);
    formData.append('releve_note', releveNote);

    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/orientation/submit-initial/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error submitting initial orientation:', error);
    throw error;
  }
};

/**
 * Submit answers to orientation questions
 * @param {number} sessionId - Session ID from initial submission
 * @param {Array<Object>} reponses - Array of {question_id, reponse}
 * @returns {Promise<Object>} Response with filieres and conseil_general
 */
export const submitOrientationReponses = async (sessionId, reponses) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/orientation/submit-reponses/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        reponses: reponses
      })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error submitting orientation responses:', error);
    throw error;
  }
};

/**
 * Generic API call helper
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    
    const config = {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      }
    };

    // Add Content-Type for JSON if body is present and not FormData
    if (options.body && !(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    throw error;
  }
};

export default {
  submitInitialOrientation,
  submitOrientationReponses,
  apiCall
};