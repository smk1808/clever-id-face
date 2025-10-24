// API configuration and helper functions for Flask backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Student {
  name: string;
  roll: string;
  class: string;
  section: string;
  reg_no: string;
}

export interface AttendanceRecord {
  id: number;
  name: string;
  timestamp: string;
  confidence?: number;
}

export interface TrainingStatus {
  status: string;
  progress?: number;
  message?: string;
}

export interface RecognitionResult {
  name: string;
  confidence: number;
  message: string;
}

export interface AttendanceStats {
  dates: string[];
  counts: number[];
}

// Add new student
export const addStudent = async (student: Student): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/add_student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(student),
  });
  return response.json();
};

// Upload face images for a student
export const uploadFaceImages = async (name: string, images: File[]): Promise<any> => {
  const formData = new FormData();
  formData.append('name', name);
  images.forEach((image, index) => {
    formData.append('images', image);
  });

  const response = await fetch(`${API_BASE_URL}/upload_face`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

// Start model training
export const startTraining = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/train_model`);
  return response.json();
};

// Get training status
export const getTrainingStatus = async (): Promise<TrainingStatus> => {
  const response = await fetch(`${API_BASE_URL}/train_status`);
  return response.json();
};

// Recognize face from image
export const recognizeFace = async (imageBlob: Blob): Promise<RecognitionResult> => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'capture.jpg');

  const response = await fetch(`${API_BASE_URL}/recognize_face`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

// Get attendance statistics
export const getAttendanceStats = async (): Promise<AttendanceStats> => {
  const response = await fetch(`${API_BASE_URL}/attendance_stats`);
  return response.json();
};

// Get attendance records with optional period filter
export const getAttendanceRecords = async (period?: string): Promise<AttendanceRecord[]> => {
  const url = period 
    ? `${API_BASE_URL}/attendance_record?period=${period}`
    : `${API_BASE_URL}/attendance_record`;
  const response = await fetch(url);
  return response.json();
};

// Download CSV
export const downloadCSV = (): void => {
  window.open(`${API_BASE_URL}/download_csv`, '_blank');
};
