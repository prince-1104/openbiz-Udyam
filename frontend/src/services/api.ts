import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Step1Data {
  aadhaarNumber: string;
  mobileNumber: string;
}

export interface Step1Response {
  message: string;
  registrationId: string;
  step: number;
  demoOTP: string;
  note: string;
}

export interface Step1VerifyOTPData {
  registrationId: string;
  otp: string;
}

export interface Step1VerifyOTPResponse {
  message: string;
  registrationId: string;
  step1Completed: boolean;
  canProceedToStep2: boolean;
}

export interface Step2Data {
  panNumber: string;
  businessName: string;
  ownerName: string;
  dateOfBirth: string;
  gender: string;
  socialCategory: string;
  physicallyHandicapped?: boolean;
  exServiceman?: boolean;
}

export interface Step2Response {
  message: string;
  registrationId: string;
  udyamNumber: string;
  step2Completed: boolean;
  registrationStatus: string;
}

export interface RegistrationStatus {
  id: string;
  step1Completed: boolean;
  step2Completed: boolean;
  registrationStatus: string;
  udyamNumber?: string;
  createdAt: string;
  submittedAt?: string;
}

export interface RegistrationProgress {
  step1: boolean;
  step2: boolean;
  total: number;
}

export interface RegistrationResponse {
  registration: RegistrationStatus;
  progress: RegistrationProgress;
}

// Step 1 API calls
export const step1API = {
  initiate: async (data: Step1Data): Promise<Step1Response> => {
    const response = await api.post<Step1Response>('/step1/initiate', data);
    return response.data;
  },

  verifyOTP: async (data: Step1VerifyOTPData): Promise<Step1VerifyOTPResponse> => {
    const response = await api.post<Step1VerifyOTPResponse>('/step1/verify-otp', data);
    return response.data;
  },
};

// Step 2 API calls
export const step2API = {
  submit: async (registrationId: string, data: Step2Data): Promise<Step2Response> => {
    const response = await api.post<Step2Response>('/step2/submit', {
      registrationId,
      ...data,
    });
    return response.data;
  },
};

// Registration status API calls
export const registrationAPI = {
  getStatus: async (id: string): Promise<RegistrationResponse> => {
    const response = await api.get<RegistrationResponse>(`/registration/${id}`);
    return response.data;
  },
};

// Admin API calls
export const adminAPI = {
  getAllRegistrations: async () => {
    const response = await api.get('/admin/registrations');
    return response.data;
  },
};

export default api;
