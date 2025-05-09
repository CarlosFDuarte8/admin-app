import apiClient from './client';
import { User } from '../models/User';

export const UserService = {
  async registerActiveUser(userData: User): Promise<User> {
    console.log('userData: ',userData)
    try {
      const response = await apiClient.post('/api/usuario/useractive', userData);
      console.log('response: ', response)
      return response.data;
    } catch (error) {
      console.error(error)
      throw new Error('Failed to register user');
    }
  },
};