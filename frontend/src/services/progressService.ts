import axios from 'axios';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const progressService = {
  async getProgress() {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/progress/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      // Map to frontend expectation
      return {
        data: [], // Historical data points
        stats: {
          currentScore: data.average_score,
          previousScore: 0,
          bestScore: data.average_score,
          averageScore: data.average_score,
          improvementPercentage: 0,
          totalInterviews: data.total_interviews,
          readinessScore: data.average_score,
          readinessLabel: 'Ready',
        },
        strongAreas: [],
        weakAreas: [],
      };
    } catch (error) {
      console.error('Failed to get progress:', error);
      throw error;
    }
  },
};
