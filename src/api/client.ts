import axios from 'axios';

const BASE_URL = 'https://noar-health-api-dev.azurewebsites.net';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;