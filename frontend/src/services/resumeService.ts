import axios from 'axios';
import type { ExtractedResumeInfo } from '../types';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const VALID_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_MB = 10;

export interface ResumeValidationResult {
  valid: boolean;
  reason?: string;
  extractedInfo?: ExtractedResumeInfo;
  id?: string;
}

export const resumeService = {
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!VALID_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only PDF and DOCX files are supported.' };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `File size must be under ${MAX_SIZE_MB}MB.` };
    }
    return { valid: true };
  },

  async processResume(file: File): Promise<ResumeValidationResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/resumes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // The backend returns the saved resume object
      // For now, we'll map it to the expected interface
      // Real implementation would have a background task or immediate extraction
      return {
        valid: true,
        id: response.data.id.toString(),
        extractedInfo: {
          name: '', // In a real app, these would come from extraction service
          education: [],
          skills: [],
          projects: [],
          experience: [],
          internships: [],
          certifications: [],
          technologies: [],
        },
      };
    } catch (error: any) {
      return {
        valid: false,
        reason: error.response?.data?.detail || 'Failed to process resume.',
      };
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
