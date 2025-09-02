import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login function for admin/employee
export const login = async (employeeId, password) => {
  try {
    const response = await api.post('/auth/login', {
      email: employeeId, // Your backend expects email field
      password,
      role: 'employee' // This tells your backend to check employee_registry table
    });
    
    // Your backend returns the employee data if authentication is successful
    return response.data;
  } catch (error) {
    // Handle different error scenarios
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid credentials');
    } else if (error.response?.status === 404) {
      throw new Error('Employee not found');
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

export default api;