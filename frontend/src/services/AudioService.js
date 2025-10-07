import axios from 'axios';

// Get backend URL from environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Audio service for handling audio uploads and validation
export const AudioService = {
  uploadLocalAudio: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${BACKEND_URL}/api/upload-audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for large files
      });

      if (response.data && response.data.audio_url) {
        // Return the full URL to access the audio file
        return `${BACKEND_URL}${response.data.audio_url}`;
      } else {
        throw new Error('Upload failed: No audio URL returned');
      }
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw new Error(error.response?.data?.detail || 'Failed to upload audio file');
    }
  },

  validateAudioUrl: async (url) => {
    try {
      // Try to create an audio element and load the URL
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
          resolve(true);
        });
        audio.addEventListener('error', () => {
          resolve(false);
        });
        audio.src = url;
      });
    } catch (error) {
      return false;
    }
  },
};