import apiClient from './client';
import { User } from '../models/User';
import { UserLoggedType } from '../types/UserType';

export const UserService = {
  async registerActiveUser(userData: UserLoggedType): Promise<UserLoggedType> {
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

  async getUserById(userId: string): Promise<UserLoggedType> {
    try {
      const response = await apiClient.get(`/api/usuario/${userId}`);
      return response.data;
    } catch (error) {
      console.error(error)
      throw new Error('Failed to fetch user');
    }
  },

  async putUserById(userId: string, userData: UserLoggedType): Promise<UserLoggedType> {
    try {
      const response = await apiClient.put(`/api/usuario/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(error)
      throw new Error('Failed to update user');
    }
  }
};