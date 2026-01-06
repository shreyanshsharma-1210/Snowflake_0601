/**
 * MedViT API Configuration
 * Centralized API configuration for the HealthSaarthi frontend
 */

export const API_CONFIG = {
  // Base URL for MedViT API
  BASE_URL: process.env.REACT_APP_MEDVIT_API_URL || 'http://localhost:5001',
  
  // API Endpoints
  ENDPOINTS: {
    PREDICT: '/api/predict',
    DATASETS: '/api/datasets', 
    HEALTH: '/api/health'
  },
  
  // Request timeouts (in milliseconds)
  TIMEOUTS: {
    HEALTH_CHECK: 5000,
    PREDICTION: 60000,
    DATASETS: 10000
  },
  
  // Default request options
  DEFAULT_OPTIONS: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

/**
 * MedViT API Client
 * Provides methods to interact with the MedViT API
 */
export class MedViTAPIClient {
  private baseUrl: string;
  
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;
  }
  
  /**
   * Check API health status
   */
  async checkHealth(): Promise<{ status: string; [key: string]: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUTS.HEALTH_CHECK);
    
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.HEALTH}`, {
        ...API_CONFIG.DEFAULT_OPTIONS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  /**
   * Get available datasets
   */
  async getDatasets(): Promise<{ success: boolean; datasets: any; [key: string]: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUTS.DATASETS);
    
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.DATASETS}`, {
        ...API_CONFIG.DEFAULT_OPTIONS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to get datasets: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  /**
   * Predict disease from medical image
   */
  async predictDisease(params: {
    image: string;
    dataset: string;
    model_type: string;
    image_size?: number;
  }): Promise<{ success: boolean; [key: string]: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUTS.PREDICTION);
    
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PREDICT}`, {
        method: 'POST',
        ...API_CONFIG.DEFAULT_OPTIONS,
        signal: controller.signal,
        body: JSON.stringify({
          image: params.image,
          dataset: params.dataset,
          model_type: params.model_type,
          image_size: params.image_size || 224
        })
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Export singleton instance
export const medvitAPI = new MedViTAPIClient();
