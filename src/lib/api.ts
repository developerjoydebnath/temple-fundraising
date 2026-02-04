import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle errors or tokens if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    const message = error.response?.data?.error || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
