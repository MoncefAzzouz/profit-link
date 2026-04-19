import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ECOTRACK_URL = process.env.ECOTRACK_URL || 'https://api.ecotrack.dz/';
const ECOTRACK_API_TOKEN = process.env.ECOTRACK_API_TOKEN;

const ecotrackApi = axios.create({
  baseURL: ECOTRACK_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add Bearer token to all requests
ecotrackApi.interceptors.request.use((config) => {
  if (ECOTRACK_API_TOKEN) {
    config.headers.Authorization = `Bearer ${ECOTRACK_API_TOKEN}`;
  }
  return config;
});

export class EcotrackService {
  /**
   * Fetch all active wilayas
   */
  static async getWilayas() {
    try {
      const response = await ecotrackApi.get('/api/v1/get/wilayas');
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (getWilayas):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetch all active communes for a specific wilaya
   */
  static async getCommunes(wilayaId?: string | number) {
    try {
      const url = wilayaId ? `/api/v1/get/communes?wilaya_id=${wilayaId}` : '/api/v1/get/communes';
      const response = await ecotrackApi.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (getCommunes):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new order in Ecotrack
   */
  static async createOrder(orderData: any) {
    try {
      const response = await ecotrackApi.post('/api/v1/create/order', null, {
        params: orderData
      });
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (createOrder):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Validate and expedite an order
   */
  static async validateOrder(tracking: string, askCollection: boolean = true) {
    try {
      const response = await ecotrackApi.post('/api/v1/valid/order', null, {
        params: { 
          tracking,
          ask_collection: askCollection ? 1 : 0
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (validateOrder):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get tracking info for an order
   */
  static async getTrackingInfo(tracking: string) {
    try {
      const response = await ecotrackApi.get('/api/v1/get/tracking/info', {
        params: { tracking }
      });
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (getTrackingInfo):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get orders status overview
   */
  static async getOrdersStatus(trackings: string[], statusList: string[]) {
    try {
      const response = await ecotrackApi.get('/api/v1/get/orders/status', {
        params: {
          trackings: trackings.join(','),
          status: statusList.join(',')
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (getOrdersStatus):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetch shipping fees/rates
   */
  static async getFees() {
    try {
      const response = await ecotrackApi.get('/api/v1/get/fees');
      return response.data;
    } catch (error: any) {
      console.error('Ecotrack Error (getFees):', error.response?.data || error.message);
      throw error;
    }
  }
}
